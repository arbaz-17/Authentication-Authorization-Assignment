import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ApiClientError } from "@/api/errors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "../features/auth/auth.context";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(1024, "Password is too long."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const demoAccounts = [
  {
    role: "Admin",
    email: "admin@example.test",
    password: "AdminDemo#2026Secure!",
  },
  {
    role: "Manager",
    email: "manager@example.test",
    password: "ManagerDemo#2026Secure!",
  },
  {
    role: "Viewer",
    email: "viewer@example.test",
    password: "ViewerDemo#2026Secure!",
  },
] as const;

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return "Invalid email or password.";
    }

    if (error.status === 429) {
      return "Too many login attempts. Try again later.";
    }

    if (error.code === "NETWORK_ERROR") {
      return "Cannot connect to the server. Please try again.";
    }

    if (error.code === "REQUEST_TIMEOUT") {
      return "The request timed out. Please try again.";
    }
  }

  return "Sign-in failed. Please try again.";
}

export function LoginPage() {
  const { login, state } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function fillDemoAccount(account: (typeof demoAccounts)[number]) {
    reset({
      email: account.email,
      password: account.password,
    });

    setServerError(null);
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      setServerError(getLoginErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-xl space-y-8">
        <header className="space-y-3 text-center text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]">
            Optimus Fox
          </p>

          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl text-white">
            Authentication Authorization
            <span className="mt-1 block">Week 13 Assignment</span>
          </h1>

          <p className="mx-auto max-w-md text-sm leading-relaxed opacity-80 sm:text-base">
            A secure access control portal demonstrating authentication, session
            management, and role-based authorization.
          </p>
        </header>

        <Card className="mx-auto w-full max-w-md shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>

            <CardDescription>
              Enter your credentials to access the dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {state.status === "expired" && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  Your session has expired or is no longer valid. Please sign in
                  again.
                </AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.test"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />

                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                />

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="space-y-3 border-t border-border pt-5">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Try a Demo Account</p>

                <p className="text-xs text-muted-foreground">
                  Select a role to automatically fill the login credentials.
                </p>
              </div>

              <div
                role="group"
                aria-label="Demo account selection"
                className="grid grid-cols-3 gap-2"
              >
                {demoAccounts.map((account) => (
                  <Button
                    key={account.role}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => fillDemoAccount(account)}
                  >
                    {account.role}
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Each role has different permissions. Select a role, then click
                Sign In to explore its access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
