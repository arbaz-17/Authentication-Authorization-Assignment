import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Authentication routes
apiRouter.use("/auth", authRouter);

// Future:
// apiRouter.use("/resources", resourceRouter);
// apiRouter.use("/users", userRouter);