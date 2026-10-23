import express from "express";

import {
  ApiError,
  errorHandler,
} from "./middleware/error-handler.js";

export const app = express();


app.disable("x-powered-by");


app.use(express.json({ limit: "16kb" }));


app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});


app.use((_req, _res, next) => {
  next(
    new ApiError(
      404,
      "NOT_FOUND",
      "The requested endpoint was not found."
    )
  );
});

// Centralized error handling must be last.
app.use(errorHandler);