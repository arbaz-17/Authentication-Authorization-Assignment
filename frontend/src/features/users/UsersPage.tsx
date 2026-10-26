import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import { usersService } from "./users.service";

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersService.list(signal),
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Users
        </h1>

        <p className="text-sm text-muted-foreground">
          View registered users and their assigned roles.
          This page is restricted to administrators.
        </p>
      </header>

      <nav aria-label="Page navigation">
        <Link
          to="/dashboard"
          className="text-sm text-primary underline"
        >
          Back to Dashboard
        </Link>
      </nav>

      {usersQuery.isPending && (
        <p role="status" className="text-sm">
          Loading users...
        </p>
      )}

      {usersQuery.isError && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            {usersQuery.error.message}
          </p>

          <Button
            variant="outline"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            {usersQuery.isFetching
              ? "Retrying..."
              : "Retry"}
          </Button>
        </div>
      )}

      {usersQuery.isSuccess &&
        usersQuery.data.users.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No users found.
          </p>
        )}

      {usersQuery.isSuccess &&
        usersQuery.data.users.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th scope="col" className="p-3">
                    Email
                  </th>

                  <th scope="col" className="p-3">
                    Role
                  </th>

                  <th scope="col" className="p-3">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {usersQuery.data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {user.email}
                    </td>

                    <td className="p-3">
                      <span className="inline-block rounded-md bg-muted px-2 py-1 capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3 text-muted-foreground">
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}