import express from "express";
import cookieParser from "cookie-parser";

import { ApiError, errorHandler } from "./middleware/error-handler.js";

import { apiRouter } from "./routes/api.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(express.json({ limit: "16kb" }));

app.use(cookieParser());

app.use("/api", apiRouter);

app.use((_req, _res, next) => {
  next(new ApiError(404, "NOT_FOUND", "The requested endpoint was not found."));
});

app.use(errorHandler);
