import { UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { usersService } from "../features/users/users.service";

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => usersService.list(signal),
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          View registered accounts and their assigned roles. Only administrators
          can access this page.
        </p>
      </header>

      {usersQuery.isSuccess && (
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            {usersQuery.data.users.length} users
          </span>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            Admin access
          </span>
        </div>
      )}

      {usersQuery.isPending && (
        <p
          role="status"
          className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
        >
          Loading users...
        </p>
      )}

      {usersQuery.isError && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/20 bg-card p-6"
        >
          <p className="text-sm text-destructive">{usersQuery.error.message}</p>

          <Button
            variant="outline"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            {usersQuery.isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      )}

      {usersQuery.isSuccess && usersQuery.data.users.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <UsersRound
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">No users found</p>
          <p className="text-sm text-muted-foreground">
            Registered accounts will appear here.
          </p>
        </div>
      )}

      {usersQuery.isSuccess && usersQuery.data.users.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <Table className="min-w-[520px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Email
                </TableHead>

                <TableHead scope="col" className="px-4">
                  Role
                </TableHead>

                <TableHead scope="col" className="px-4">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {usersQuery.data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-normal px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {user.email.slice(0, 1).toUpperCase()}
                      </span>

                      <span className="break-all">{user.email}</span>
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span
                      className={
                        user.role === "admin"
                          ? "inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary"
                          : "inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-foreground-secondary"
                      }
                    >
                      {user.role}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
