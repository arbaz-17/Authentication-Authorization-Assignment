import express from "express";
import cookieParser from "cookie-parser";

import {
  ApiError,
  errorHandler,
} from "./middleware/error-handler.js";

import { apiRouter } from "./routes/api.routes.js";

export const app = express();

app.disable("x-powered-by");

// Parse JSON request bodies.
app.use(express.json({ limit: "16kb" }));

// Parse incoming cookies.
app.use(cookieParser());

// Application API routes.
app.use("/api", apiRouter);

// Handle unknown endpoints.
app.use((_req, _res, next) => {
  next(
    new ApiError(
      404,
      "NOT_FOUND",
      "The requested endpoint was not found."
    )
  );
});

// Centralized error handling.
app.use(errorHandler);