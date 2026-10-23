import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Future feature routers will be registered here:
// apiRouter.use("/auth", authRouter);
// apiRouter.use("/resources", resourceRouter);
// apiRouter.use("/users", userRouter);