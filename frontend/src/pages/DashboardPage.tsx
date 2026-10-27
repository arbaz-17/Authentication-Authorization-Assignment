import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AuthUser, Permission } from "@/features/auth/auth.types";

interface DashboardPageProps {
  user: AuthUser;
}

const permissionLabels: Record<Permission, string> = {
  "resource:read": "View resources",
  "resource:create": "Create resources",
  "resource:update": "Edit resources",
  "resource:delete": "Delete resources",
  "user:manage": "View users",
};

export function DashboardPage({ user }: DashboardPageProps) {
  const roleLabel = user.role[0].toUpperCase() + user.role.slice(1);

  return (
    <div className="space-y-7">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Welcome back. Here is an overview of your access.
          </p>
        </div>

      </div>

      <section
        aria-label="Account summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4 text-primary" aria-hidden="true" />
              Account role
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xl font-semibold">{roleLabel}</p>
            <p className="text-xs text-muted-foreground">
              Assigned access level
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <KeyRound className="size-4 text-primary" aria-hidden="true" />
              Permissions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xl font-semibold">{user.permissions.length}</p>
            <p className="text-xs text-muted-foreground">Available actions</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Session
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xl font-semibold">Active</p>
            <p className="text-xs text-muted-foreground">
              Authenticated in this browser
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        aria-label="Account information and permissions"
        className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Account details</CardTitle>

            <p className="text-sm text-muted-foreground">
              Your current account information.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex gap-3">
              <Mail
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email address</p>

                <p className="mt-1 break-all text-sm font-medium">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex gap-3">
              <LockKeyhole
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Account ID</p>

                <p className="mt-1 break-all font-mono text-xs text-foreground-secondary">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your permissions */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Your permissions</CardTitle>

            <p className="text-sm text-muted-foreground">
              Actions currently granted to your account.
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-background/60 p-3"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {permissionLabels[permission]}
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      {permission}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
