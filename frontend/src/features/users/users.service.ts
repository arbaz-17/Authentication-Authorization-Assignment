import { apiRequest } from "@/api/client";

import type { Role } from "@/features/auth/auth.types";

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UsersResponse {
  users: UserSummary[];
}

export const usersService = {
  list(signal?: AbortSignal): Promise<UsersResponse> {
    return apiRequest<UsersResponse>({
      method: "GET",
      url: "/users",
      signal,
    });
  },
};