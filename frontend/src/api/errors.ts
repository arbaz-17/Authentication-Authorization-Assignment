import axios from "axios";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function readBackendError(data: unknown): {
  code?: string;
  message?: string;
} | null {
  if (
    typeof data !== "object" ||
    data === null ||
    !("error" in data)
  ) {
    return null;
  }

  const error = data.error;

  if (typeof error !== "object" || error === null) {
    return null;
  }

  return {
    code:
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined,

    message:
      "message" in error && typeof error.message === "string"
        ? error.message
        : undefined,
  };
}

export function normalizeApiError(error: unknown): Error {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new ApiClientError(
      "Request was cancelled.",
      "REQUEST_CANCELLED"
    );
  }

  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error
      : new Error("An unexpected client error occurred.");
  }

  if (!error.response) {
    const timedOut =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT";

    return new ApiClientError(
      timedOut
        ? "The request timed out."
        : "Unable to connect to the server.",
      timedOut ? "REQUEST_TIMEOUT" : "NETWORK_ERROR"
    );
  }

  const status = error.response.status;
  const backendError = readBackendError(error.response.data);

  return new ApiClientError(
    backendError?.message ?? `Request failed (HTTP ${status}).`,
    backendError?.code ?? "HTTP_ERROR",
    status
  );
}