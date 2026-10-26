import type { RequestHandler } from "express";

import { ApiError } from "./error-handler.js";

import type { Permission } from "../modules/auth/permissions.js";

export function requirePermission(
  permission: Permission
): RequestHandler {
  return (_req, res, next) => {
    const auth = res.locals.auth;

    if (!auth) {
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Authentication is required."
      );
    }

    if (!auth.permissions.includes(permission)) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You do not have permission to perform this action."
      );
    }

    next();
  };
}