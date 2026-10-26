import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        403 — Forbidden
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Access denied
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        You're signed in, but your account doesn't have permission
        to access this page.
      </p>
      <Button variant="outline" asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </section>
  );
}
