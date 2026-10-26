import type { RequestHandler } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../../db/index.js";
import { sessions, users } from "../../db/schema.js";
import { ApiError } from "../../middleware/error-handler.js";

import { verifyAccessToken } from "./jwt.js";
import { getPermissions } from "./permissions.js";
import type { Permission, Role } from "./permissions.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

// Extend Express response-local types.
declare global {
  namespace Express {
    interface Locals {
      auth?: AuthenticatedUser;
    }
  }
}

export const requireAuth: RequestHandler = async (
  req,
  res,
  next
) => {
  const authorization = req.get("Authorization");

  // Require exactly one Bearer credential.
  const match = /^Bearer ([^\s]+)$/i.exec(
    authorization ?? ""
  );

  const accessToken = match?.[1];

  if (!accessToken) {
    throw new ApiError(
      401,
      "AUTH_REQUIRED",
      "Authentication is required."
    );
  }

  // Verify JWT signature, expiry and claims.
  const { userId, sessionId } =
    await verifyAccessToken(accessToken);

  // Validate the current server-side session and user.
  const user = db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(
      users,
      eq(sessions.userId, users.id)
    )
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .get();

  if (!user) {
    throw new ApiError(
      401,
      "AUTH_SESSION_INVALID",
      "Session is invalid or has expired."
    );
  }

  // Obtain current permissions from the database role.
  res.locals.auth = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: getPermissions(user.role),
  };

  next();
};