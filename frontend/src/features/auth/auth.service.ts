import axios from "axios";

import { apiRequest } from "@/api/client";
import { normalizeApiError } from "@/api/errors";

import type {
  AuthSessionResponse,
  CurrentUserResponse,
  LoginCredentials,
} from "./auth.types";

const authClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
});

async function authPost<T>(
  path: string,
  body?: unknown
): Promise<T> {
  try {
    const response = await authClient.post<T>(
      path,
      body
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

let restorationPromise:
  | Promise<AuthSessionResponse>
  | null = null;

export const authService = {
  login(
    credentials: LoginCredentials
  ): Promise<AuthSessionResponse> {
    return authPost<AuthSessionResponse>(
      "/auth/login",
      credentials
    );
  },

  refresh(): Promise<AuthSessionResponse> {
    if (!restorationPromise) {
      restorationPromise =
        authPost<AuthSessionResponse>(
          "/auth/refresh"
        ).finally(() => {
          restorationPromise = null;
        });
    }

    return restorationPromise;
  },

  async logout(): Promise<void> {
    await authPost<void>("/auth/logout");
  },

  getCurrentUser(): Promise<CurrentUserResponse> {
    return apiRequest<CurrentUserResponse>({
      method: "GET",
      url: "/auth/me",
    });
  },

  async waitForPendingRefresh(): Promise<void> {
  const pending = restorationPromise;

  if (!pending) {
    return;
  }
  try {
    await pending;
  } catch {
    // The caller only needs the request to settle.
  }
},
};