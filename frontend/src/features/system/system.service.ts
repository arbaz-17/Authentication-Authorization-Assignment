import { apiRequest } from "@/api/client";

export interface HealthResponse {
  status: "ok";
}

export const systemService = {
  getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return apiRequest<HealthResponse>({
      method: "GET",
      url: "/health",
      signal,
    });
  },
};