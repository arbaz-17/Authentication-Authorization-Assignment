import { Link, Navigate, Route, Routes } from "react-router";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/features/auth/auth.context";

import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/auth/DashboardPage";
import { RequireAuth, RequirePermission } from "@/routes/RouteGuards";
import { ResourcesPage } from "@/features/resources/ResourcesPage";
import { UsersPage } from "@/features/users/UsersPage";

import { ForbiddenPage } from "@/pages/ForbiddenPage";

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
  const { state, retryRestoration, logout } = useAuth();

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
        {logoutIssue ? "Retry Logout" : "Retry Session Check"}
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
      <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>

      <Link to="/" className="text-sm underline">
        Return to application
      </Link>
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={state.status === "authenticated" ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route path="/login" element={<LoginRoute />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardRoute />} />

        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route element={<RequirePermission permission="resource:read" />}>
          <Route path="/resources" element={<ResourcesPage />} />
        </Route>

        <Route element={<RequirePermission permission="user:manage" />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
