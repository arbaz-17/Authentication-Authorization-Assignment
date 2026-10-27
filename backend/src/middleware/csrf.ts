import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { ApiError } from "./error-handler.js";

export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("Origin");

  if (origin !== undefined) {
    if (origin === env.TRUSTED_ORIGIN) {
      next();
      return;
    }

    next(
      new ApiError(
        403,
        "CSRF_ORIGIN_REJECTED",
        "Request origin is not trusted.",
      ),
    );
    return;
  }

  const referer = req.get("Referer");

  if (referer) {
    try {
      const source = new URL(referer);

      if (source.origin === env.TRUSTED_ORIGIN) {
        next();
        return;
      }
    } catch {
      // Invalid Referer is rejected below.
    }
  }
  next(
    new ApiError(403, "CSRF_ORIGIN_REJECTED", "Request origin is not trusted."),
  );
};
