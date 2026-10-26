import type { ErrorRequestHandler } from "express";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function hasErrorType(error: unknown, type: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === type
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (hasErrorType(error, "entity.parse.failed")) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON.",
      },
    });
    return;
  }

  if (hasErrorType(error, "entity.too.large")) {
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds the allowed size.",
      },
    });
    return;
  }

  if (process.env.NODE_ENV === "development") {
  console.error(
    "Unhandled API error:",
    error instanceof Error ? error.stack : error
  );
} else {
  console.error("Unhandled API error");
}

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred.",
    },
  });
};