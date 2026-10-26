import { createContext, useContext } from "react";

import type { AuthUser, LoginCredentials } from "./auth.types";

export type AuthState =
  | {
      status: "loading" | "unauthenticated";
      user: null;
    }
  | {
      status: "authenticated";
      user: AuthUser;
    }
  | {
      status: "unavailable";
      user: null;
      issue: "restoration" | "logout";
    }
  | {
      status: "expired";
      user: null;
    };

export interface AuthContextValue {
  state: AuthState;

  login(credentials: LoginCredentials): Promise<void>;

  logout(): Promise<void>;

  retryRestoration(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
