import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { FolderKanban, LayoutDashboard, LogOut, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth.context";

function navClass(isActive: boolean): string {
  return [
    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");
}

function NavigationLinks({ showUsers }: { showUsers: boolean }) {
  return (
    <>
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) => navClass(isActive)}
      >
        <LayoutDashboard className="size-4" aria-hidden="true" />
        Dashboard
      </NavLink>
      <NavLink to="/resources" className={({ isActive }) => navClass(isActive)}>
        <FolderKanban className="size-4" aria-hidden="true" />
        Resources
      </NavLink>
      {showUsers && (
        <NavLink to="/users" className={({ isActive }) => navClass(isActive)}>
          <Users className="size-4" aria-hidden="true" />
          Users
        </NavLink>
      )}
    </>
  );
}

export function AppLayout() {
  const { state, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (state.status !== "authenticated") {
    return null;
  }

  const user = state.user;
  const showUsers = user.permissions.includes("user:manage");
  const roleLabel = user.role[0].toUpperCase() + user.role.slice(1);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    try {
      await logout();
    } catch {
      // AuthProvider shows its existing logout-unavailable screen.
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-16 items-center justify-between gap-3">
            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-3 rounded-md"
              aria-label="Dashboard"
            >
              <span className="font-semibold tracking-tight sm:text-base">
                Optimus Fox
              </span>
            </Link>

            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 md:flex"
            >
              <NavigationLinks showUsers={showUsers} />
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {roleLabel}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={signingOut}
                onClick={() => void handleSignOut()}
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {signingOut ? "Signing out..." : "Sign out"}
                </span>
                <span className="sr-only sm:hidden">Sign out</span>
              </Button>
            </div>
          </div>

          <nav
            aria-label="Mobile navigation"
            className="flex gap-1 overflow-x-auto pb-3 md:hidden"
          >
            <NavigationLinks showUsers={showUsers} />
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <Outlet />
      </main>
    </div>
  );
}
