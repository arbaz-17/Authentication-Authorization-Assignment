import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "./auth.middleware.js";
import { z } from "zod";

import { requireTrustedOrigin } from "../../middleware/csrf.js";
import { ApiError } from "../../middleware/error-handler.js";

import { setRefreshCookie } from "./cookies.js";
import { loginUser } from "./login.service.js";

import { refreshSession } from "./refresh.service.js";

import {
  clearRefreshCookie,
  readRefreshCookie,
} from "./cookies.js";

import { revokeSession } from "./logout.service.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(1024),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "AUTH_RATE_LIMITED",
        message: "Too many login attempts. Try again later.",
      },
    });
  },
});

authRouter.post(
  "/login",
  requireTrustedOrigin,
  loginLimiter,
  async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "A valid email and password are required."
      );
    }

    const session = await loginUser(
      result.data.email,
      result.data.password
    );

    setRefreshCookie(
      res,
      session.refreshCookie,
      session.sessionExpiresAt
    );

    res.status(200).json({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      user: session.user,
    });
  }
);

authRouter.get(
  "/me",
  requireAuth,
  (_req, res) => {
    const user = res.locals.auth;

    // Fail closed if authentication context is missing.
    if (!user) {
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Authentication is required."
      );
    }

    // Prevent caching of authenticated user information.
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      user,
    });
  }
);

authRouter.post(
  "/logout",
  requireTrustedOrigin,
  (req, res) => {
    res.set("Cache-Control", "no-store");

    const rawCredential = readRefreshCookie(req);

    const revoked = revokeSession(rawCredential);

    // Clear the browser cookie even if the credential
    // was missing, expired, or invalid.
    clearRefreshCookie(res);

    if (!revoked) {
      throw new ApiError(
        401,
        "AUTH_SESSION_INVALID",
        "Session is invalid or has expired."
      );
    }

    res.status(204).send();
  }
);


authRouter.post(
  "/refresh",
  requireTrustedOrigin,
  async (req, res) => {
    res.set("Cache-Control", "no-store");

    const rawCredential = readRefreshCookie(req);

    const result = await refreshSession(rawCredential);

    setRefreshCookie(
      res,
      result.refreshCookie,
      result.sessionExpiresAt
    );

    res.status(200).json({
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      user: result.user,
    });
  }
);