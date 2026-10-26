import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/features/auth/auth.context";
import {
  resourcesService,
  type Resource,
  type ResourceInput,
} from "./resources.service";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export function ResourcesPage() {
  const { state } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const permissions =
    state.status === "authenticated"
      ? state.user.permissions
      : [];

  const canCreate = permissions.includes("resource:create");
  const canUpdate = permissions.includes("resource:update");
  const canDelete = permissions.includes("resource:delete");

  const resourceQuery = useQuery({
    queryKey: ["resources"],
    queryFn: ({ signal }) => resourcesService.list(signal),
  });

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | null;
      data: ResourceInput;
    }) =>
      id
        ? resourcesService.update(id, data)
        : resourcesService.create(data),

    onSuccess: async () => {
      setDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["resources"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: resourcesService.remove,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["resources"],
      });
    },
  });

  function openEditor(resource?: Resource) {
    setEditing(resource ?? null);
    setTitle(resource?.title ?? "");
    setDescription(resource?.description ?? "");
    setFormError(null);
    saveMutation.reset();
    setDialogOpen(true);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setFormError("Title is required.");
      return;
    }

    setFormError(null);

    saveMutation.mutate({
      id: editing?.id ?? null,
      data: {
        title: cleanTitle,
        description: description.trim() || null,
      },
    });
  }

  function handleDelete(resource: Resource) {
    if (
      !window.confirm(
        `Delete "${resource.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    deleteMutation.mutate(resource.id);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground">
            Manage resources according to your permissions.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => openEditor()}>
            Create Resource
          </Button>
        )}
      </header>

      <nav aria-label="Page navigation">
        <Link
          to="/dashboard"
          className="text-sm text-primary underline"
        >
          Back to Dashboard
        </Link>
      </nav>

      {resourceQuery.isPending && (
        <p role="status">Loading resources...</p>
      )}

      {resourceQuery.isError && (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-destructive">
            {errorMessage(resourceQuery.error)}
          </p>
          <Button
            variant="outline"
            onClick={() => void resourceQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {resourceQuery.isSuccess &&
        resourceQuery.data.resources.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No resources found.
          </p>
        )}

      {resourceQuery.isSuccess &&
        resourceQuery.data.resources.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th scope="col" className="p-3">Title</th>
                  <th scope="col" className="p-3">Description</th>
                  {(canUpdate || canDelete) && (
                    <th scope="col" className="p-3">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {resourceQuery.data.resources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b last:border-0"
                  >
                    <td className="p-3 font-medium">
                      {resource.title}
                    </td>

                    <td className="p-3">
                      {resource.description || "—"}
                    </td>

                    {(canUpdate || canDelete) && (
                      <td className="p-3">
                        <div className="flex gap-2">
                          {canUpdate && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditor(resource)}
                            >
                              Edit
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(resource)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {deleteMutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          Delete failed: {errorMessage(deleteMutation.error)}
        </p>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saveMutation.isPending) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Resource" : "Create Resource"}
            </DialogTitle>
            <DialogDescription>
              Enter the resource information below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
                disabled={saveMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-description">
                Description
              </Label>
              <Textarea
                id="resource-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={1000}
                disabled={saveMutation.isPending}
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}

            {saveMutation.isError && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage(saveMutation.error)}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}