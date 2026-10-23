import { Link, Route, Routes, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SystemStatus } from "@/features/system/SystemStatus";

function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Authentication & Authorization</CardTitle>
          <CardDescription>
            Week 13 — Frontend Engineering Assignment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Frontend foundation is ready. Authentication,
            session management, and role-based access control
            will be implemented in the upcoming phases.
          </p>

          <SystemStatus />

          <Button onClick={() => navigate("/login")}>
            Open Login Page
          </Button>

          
        </CardContent>
      </Card>
    </main>
  );
}

function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Login functionality will be implemented in Phase 03.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link to="/" className="text-sm text-primary underline">
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
      <Link to="/" className="text-sm text-primary underline">
        Return Home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}