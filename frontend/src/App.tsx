import { Link, Navigate, Route, Routes } from "react-router";

import { Button } from "@/components/ui/button";

import {
  useAuth,
} from "@/features/auth/auth.context";

import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/auth/DashboardPage";

function LoadingScreen() {
  return (
    <main
      className="flex min-h-svh items-center justify-center p-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">
        Checking authentication...
      </p>
    </main>
  );
}

function UnavailableScreen() {
  const {
    state,
    retryRestoration,
    logout,
  } = useAuth();

  if (state.status !== "unavailable") {
    return null;
  }

  const logoutIssue = state.issue === "logout";

  async function handleRetry() {
    try {
      if (logoutIssue) {
        await logout();
      } else {
        await retryRestoration();
      }
    } catch {
      // AuthProvider manages the resulting error state.
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">
        {logoutIssue
          ? "Logout Could Not Be Confirmed"
          : "Session Verification Unavailable"}
      </h1>

      <p className="max-w-md text-sm text-muted-foreground">
        {logoutIssue
          ? "Your local access token was cleared, but server-side session revocation could not be confirmed."
          : "The server could not verify your session. This may be a temporary connection problem."}
      </p>

      <Button onClick={() => void handleRetry()}>
        {logoutIssue
          ? "Retry Logout"
          : "Retry Session Check"}
      </Button>
    </main>
  );
}

function LoginRoute() {
  const { state } = useAuth();

  if (state.status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

function DashboardRoute() {
  const { state } = useAuth();

  if (state.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <DashboardPage user={state.user} />;
}

function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        404 — Page Not Found
      </h1>

      <Link to="/" className="text-sm underline">
        Return to application
      </Link>
    </main>
  );
}

function SessionExpiredScreen() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">
        Session Ended
      </h1>

      <p className="max-w-md text-sm text-muted-foreground">
        Your session has expired or is no longer valid.
        Please sign in again to continue.
      </p>

      <Button asChild>
        <Link to="/login">Sign In Again</Link>
      </Button>
    </main>
  );
}

export default function App() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return <LoadingScreen />;
  }

  if (state.status === "unavailable") {
    return <UnavailableScreen />;
  }

  if (state.status === "expired") {
  return <SessionExpiredScreen />;
}

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={
              state.status === "authenticated"
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginRoute />}
      />

      <Route
        path="/dashboard"
        element={<DashboardRoute />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}