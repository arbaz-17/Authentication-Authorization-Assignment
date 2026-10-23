import { ApiClientError } from "@/api/errors";
import { Button } from "@/components/ui/button";

import { useHealthQuery } from "./use-health-query";

export function SystemStatus() {
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useHealthQuery();

  const errorMessage =
    error instanceof ApiClientError
      ? `${error.message} (${error.code})`
      : "An unexpected error occurred.";

  return (
    <section
      aria-labelledby="backend-status-heading"
      className="space-y-3 rounded-lg border p-4"
    >
      <h2
        id="backend-status-heading"
        className="text-sm font-semibold"
      >
        Backend Connection
      </h2>

      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {isPending
          ? "Awaiting backend response..."
          : isError
            ? `Connection failed: ${errorMessage}`
            : `Connected successfully. Status: ${data.status}`}
      </p>

      <Button
        variant="outline"
        size="sm"
        disabled={isFetching}
        onClick={() => void refetch()}
      >
        {isFetching ? "Checking..." : "Check Connection"}
      </Button>
    </section>
  );
}