import { Router } from "express";

import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";

import { requireAuth } from "../auth/auth.middleware.js";

import { requirePermission } from "../../middleware/authorize.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  requirePermission("user:manage"),
  (_req, res) => {
    const userList = db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.email)
      .all();

    res.set("Cache-Control", "no-store");

    res.status(200).json({
      users: userList,
    });
  }
);