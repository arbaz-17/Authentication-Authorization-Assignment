import express from "express";

import { ApiError, errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/api.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(express.json({ limit: "16kb" }));

// All application API routes.
app.use("/api", apiRouter);

// Unknown endpoints.
app.use((_req, _res, next) => {
  next(
    new ApiError(
      404,
      "NOT_FOUND",
      "The requested endpoint was not found."
    )
  );
});

// Error handling must remain last.
app.use(errorHandler);