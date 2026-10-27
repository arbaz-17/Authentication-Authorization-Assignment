import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiClientError, normalizeApiError } from "./errors";

import type { AuthSessionResponse } from "@/features/auth/auth.types";

import {
  getAccessToken,
  getAuthEpoch,
  setAccessToken,
} from "@/features/auth/token-store";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _authEpoch?: number;
}

interface AuthRecoveryHandlers {
  refresh: () => Promise<AuthSessionResponse>;
  onRenewed: (session: AuthSessionResponse) => void;
  onSessionLost: (reason: "expired" | "unavailable") => void;
}

let recoveryHandlers: AuthRecoveryHandlers | null = null;

export function configureAuthRecovery(
  handlers: AuthRecoveryHandlers,
): () => void {
  recoveryHandlers = handlers;

  return () => {
    if (recoveryHandlers === handlers) {
      recoveryHandlers = null;
    }
  };
}

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 90_000,
});

apiClient.interceptors.request.use((config: RetryConfig) => {
  config._authEpoch ??= getAuthEpoch();

  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const original = error.config as RetryConfig | undefined;
    const handlers = recoveryHandlers;
    const currentToken = getAccessToken();

    if (
      !original ||
      original._retry ||
      !handlers ||
      !currentToken ||
      original._authEpoch !== getAuthEpoch() ||
      original.signal?.aborted
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    const requestEpoch = getAuthEpoch();

    if (original.headers.get("Authorization") !== `Bearer ${currentToken}`) {
      return apiClient.request(original);
    }

    let session: AuthSessionResponse;

    try {
      session = await handlers.refresh();
    } catch (refreshError) {
      if (getAuthEpoch() === requestEpoch) {
        const normalized = normalizeApiError(refreshError);

        if (normalized instanceof ApiClientError && normalized.status === 401) {
          handlers.onSessionLost("expired");
        } else {
          handlers.onSessionLost("unavailable");
        }
      }

      return Promise.reject(refreshError);
    }

    if (getAuthEpoch() !== requestEpoch) {
      return Promise.reject(error);
    }

    setAccessToken(session.accessToken);
    handlers.onRenewed(session);

    const method = (original.method ?? "get").toLowerCase();

    if (!["get", "head", "options"].includes(method)) {
      return Promise.reject(
        new ApiClientError(
          "Session renewed. Please retry this action.",
          "ACTION_RETRY_REQUIRED",
          401,
        ),
      );
    }

    return apiClient.request(original);
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
