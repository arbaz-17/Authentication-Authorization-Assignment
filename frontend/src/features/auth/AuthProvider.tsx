import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import { ApiClientError } from "@/api/errors";

import { AuthContext, type AuthState } from "./auth.context";
import { authService } from "./auth.service";
import type { LoginCredentials } from "./auth.types";

import { clearAccessToken, setAccessToken } from "./token-store";
import { configureAuthRecovery } from "@/api/client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

    
  const queryClient = useQueryClient();

  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  // Invalidates outdated authentication operations.
  const operationVersion = useRef(0);

  // Restores the session without synchronously
  // updating React state.
  const restoreSession = useCallback(async (version: number) => {
    clearAccessToken();

    try {
      const session = await authService.refresh();

      if (version !== operationVersion.current) {
        return;
      }

      setAccessToken(session.accessToken);

      setState({
        status: "authenticated",
        user: session.user,
      });
    } catch (error) {
      if (version !== operationVersion.current) {
        return;
      }

      clearAccessToken();

      if (error instanceof ApiClientError && error.status === 401) {
        setState({
          status: "unauthenticated",
          user: null,
        });
      } else {
        setState({
          status: "unavailable",
          user: null,
          issue: "restoration",
        });
      }
    }
  }, []);

  // Used when the user explicitly retries restoration.
  const retryRestoration = useCallback(async () => {
    const version = ++operationVersion.current;

    setState({
      status: "loading",
      user: null,
    });

    await restoreSession(version);
  }, [restoreSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const version = ++operationVersion.current;

      clearAccessToken();

      try {
        // Prevent a pending refresh response from
        // overwriting the cookie of a new login.
        await authService.waitForPendingRefresh();

        const session = await authService.login(credentials);

        if (version !== operationVersion.current) {
          return;
        }

        // Prevent data from a previous user leaking
        // into the new authenticated session.
        await queryClient.cancelQueries();
        queryClient.clear();

        if (version !== operationVersion.current) {
          return;
        }

        setAccessToken(session.accessToken);

        setState({
          status: "authenticated",
          user: session.user,
        });
      } catch (error) {
        if (version === operationVersion.current) {
          setState({
            status: "unauthenticated",
            user: null,
          });
        }

        throw error;
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const version = ++operationVersion.current;

    clearAccessToken();

    // Cancel requests and remove user-specific data.
    await queryClient.cancelQueries();
    queryClient.clear();

    try {
      // Allow an in-flight refresh to finish first.
      await authService.waitForPendingRefresh();

      await authService.logout();

      if (version === operationVersion.current) {
        setState({
          status: "unauthenticated",
          user: null,
        });
      }
    } catch (error) {
      if (version !== operationVersion.current) {
        return;
      }

      // An already-invalid backend session is signed out.
      if (error instanceof ApiClientError && error.status === 401) {
        setState({
          status: "unauthenticated",
          user: null,
        });

        return;
      }

      // Do not claim backend revocation succeeded.
      setState({
        status: "unavailable",
        user: null,
        issue: "logout",
      });

      throw error;
    }
  }, [queryClient]);

  useEffect(() => {
  return configureAuthRecovery({
    refresh: () => authService.refresh(),

    onRenewed: (session) => {
      setState((current) => {
        if (current.status !== "authenticated") {
          return current;
        }

        return {
          status: "authenticated",
          user: session.user,
        };
      });
    },

    onSessionLost: (reason) => {
      const version = ++operationVersion.current;

      clearAccessToken();

      void queryClient.cancelQueries().then(() => {
        if (version !== operationVersion.current) {
          return;
        }

        queryClient.clear();

        if (reason === "expired") {
          setState({
            status: "expired",
            user: null,
          });
        } else {
          setState({
            status: "unavailable",
            user: null,
            issue: "restoration",
          });
        }
      });
    },
  });
}, [queryClient]);

  // Restore the authenticated session on application load.
  useEffect(() => {
    const version = ++operationVersion.current;

    void restoreSession(version);

    return () => {
      operationVersion.current += 1;
    };
  }, [restoreSession]);

  

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        retryRestoration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
