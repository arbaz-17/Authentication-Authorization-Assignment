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

import { useAuth } from "./auth.context";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(1024, "Password is too long."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      // AuthProvider updates the authentication state.
      // Routing will redirect after successful login.
    } catch (error) {
      setServerError(getLoginErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            Sign In
          </CardTitle>

          <CardDescription>
            Authentication & Authorization Module
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.test"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "email-error" : undefined
                }
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
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "password-error"
                    : undefined
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
                <AlertDescription>
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-sm font-medium">
              Demo Accounts
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              admin@example.test
              <br />
              manager@example.test
              <br />
              viewer@example.test
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Use the passwords configured during database seeding.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}