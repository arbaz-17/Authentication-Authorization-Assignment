import { useState, type FormEvent } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { useAuth } from "@/features/auth/auth.context";
import {
  resourcesService,
  type Resource,
  type ResourceInput,
} from "../features/resources/resources.service";

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
    state.status === "authenticated" ? state.user.permissions : [];

  const canCreate = permissions.includes("resource:create");
  const canUpdate = permissions.includes("resource:update");
  const canDelete = permissions.includes("resource:delete");

  const resourceQuery = useQuery({
    queryKey: ["resources"],
    queryFn: ({ signal }) => resourcesService.list(signal),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: ResourceInput }) =>
      id ? resourcesService.update(id, data) : resourcesService.create(data),

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
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) {
      return;
    }

    deleteMutation.mutate(resource.id);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage resources based on your access level.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => openEditor()}>
            <Plus className="size-4" aria-hidden="true" />
            Create resource
          </Button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {resourceQuery.isSuccess && (
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
            {resourceQuery.data.resources.length} resources
          </span>
        )}
        {!canUpdate && !canDelete && (
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            Read-only access
          </span>
        )}
      </div>

      {resourceQuery.isPending && (
        <p
          role="status"
          className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
        >
          Loading resources...
        </p>
      )}

      {resourceQuery.isError && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/20 bg-card p-6"
        >
          <p className="text-sm text-destructive">
            {errorMessage(resourceQuery.error)}
          </p>
          <Button
            variant="outline"
            onClick={() => void resourceQuery.refetch()}
            disabled={resourceQuery.isFetching}
          >
            Retry
          </Button>
        </div>
      )}

      {resourceQuery.isSuccess && resourceQuery.data.resources.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <FolderKanban
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">No resources yet</p>
          <p className="text-sm text-muted-foreground">
            {canCreate
              ? "Create your first resource to get started."
              : "No resources are available to view."}
          </p>
          {canCreate && (
            <Button size="sm" onClick={() => openEditor()}>
              <Plus className="size-4" aria-hidden="true" />
              Create resource
            </Button>
          )}
        </div>
      )}

      {resourceQuery.isSuccess && resourceQuery.data.resources.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <Table className="min-w-[520px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead scope="col" className="px-4">
                  Title
                </TableHead>

                <TableHead scope="col" className="px-4">
                  Description
                </TableHead>

                {(canUpdate || canDelete) && (
                  <TableHead scope="col" className="px-4">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {resourceQuery.data.resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <FolderKanban
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {resource.title}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-md whitespace-normal break-words px-4 py-3 text-muted-foreground">
                    {resource.description || "—"}
                  </TableCell>

                  {(canUpdate || canDelete) && (
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditor(resource)}
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
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
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
    </section>
  );
}
