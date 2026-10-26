
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SystemStatus } from "@/features/system/SystemStatus";

import type { AuthUser } from "./auth.types";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth.context";

interface DashboardPageProps {
  user: AuthUser;
}

export function DashboardPage({ user }: DashboardPageProps) {
  // ✅ Call hooks inside the component
  const { logout } = useAuth();

  // ✅ Define the handler inside the component
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // AuthProvider handles the failure state.
      // The application displays an unavailable screen.
    }
  }

  return (
    <main className="mx-auto min-h-svh max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Access Control Portal
          </h1>

          <p className="text-muted-foreground">
            Welcome, {user.email}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void handleLogout()}
        >
          Sign Out
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <p>
            <strong>User ID:</strong> {user.id}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm">
            {user.permissions.map((permission) => (
              <li key={permission}>
                {permission}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <SystemStatus />
    </main>
  );
}
