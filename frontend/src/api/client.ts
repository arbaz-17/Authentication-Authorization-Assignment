import axios, { type AxiosRequestConfig } from "axios";

import { normalizeApiError } from "./errors";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
});

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}