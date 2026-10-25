import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

import { requireTrustedOrigin } from "../../middleware/csrf.js";
import { ApiError } from "../../middleware/error-handler.js";

import { setRefreshCookie } from "./cookies.js";
import { loginUser } from "./login.service.js";

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