import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { resourcesRouter } from "../modules/resources/resources.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";


export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Authentication routes
apiRouter.use("/auth", authRouter);

apiRouter.use("/resources", resourcesRouter);
apiRouter.use("/users", usersRouter);