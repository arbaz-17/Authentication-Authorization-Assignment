import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { ApiError } from "./error-handler.js";

export const requireTrustedOrigin: RequestHandler = (
  req,
  _res,
  next
) => {
  const origin = req.get("Origin");

  // If Origin is present, require an exact match.
  if (origin !== undefined) {
    if (origin === env.TRUSTED_ORIGIN) {
      next();
      return;
    }

    next(
      new ApiError(
        403,
        "CSRF_ORIGIN_REJECTED",
        "Request origin is not trusted."
      )
    );
    return;
  }

  // Fallback when Origin is absent.
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

  // Reject missing or unverifiable source information.
  next(
    new ApiError(
      403,
      "CSRF_ORIGIN_REJECTED",
      "Request origin is not trusted."
    )
  );
};