import axios, {
  type AxiosRequestConfig,
} from "axios";

import { normalizeApiError } from "./errors";

import {
  getAccessToken,
} from "@/features/auth/token-store";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
});

// Attach the current access token to API requests.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return config;
});

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response =
      await apiClient.request<T>(config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}