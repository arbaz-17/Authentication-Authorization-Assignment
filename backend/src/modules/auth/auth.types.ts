export type Role = "admin" | "manager" | "viewer";

export type Permission =
  | "resource:read"
  | "resource:create"
  | "resource:update"
  | "resource:delete"
  | "user:manage";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface CurrentUserResponse {
  user: AuthUser;
}