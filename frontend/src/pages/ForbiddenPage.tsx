import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        403 — Forbidden
      </p>

      <h1 className="text-2xl font-semibold">
        Access Denied
      </h1>

      <p className="max-w-md text-sm text-muted-foreground">
        You are signed in, but your account does not
        have permission to access this page.
      </p>

      <Button variant="outline" asChild>
        <Link to="/dashboard">
          Back to Dashboard
        </Link>
      </Button>
    </main>
  );
}