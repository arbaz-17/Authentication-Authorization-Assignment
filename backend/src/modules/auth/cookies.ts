import type {
  CookieOptions,
  Request,
  Response,
} from "express";

import { env } from "../../config/env.js";

export const REFRESH_COOKIE_NAME = "auth_refresh";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
};

export function setRefreshCookie(
  res: Response,
  cookieValue: string,
  sessionExpiresAt: Date
): void {
  const remainingMs =
    sessionExpiresAt.getTime() - Date.now();

  if (remainingMs <= 0) {
    throw new Error("Cannot set an expired refresh session");
  }

  const maximumMs =
    env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

  res.cookie(REFRESH_COOKIE_NAME, cookieValue, {
    ...refreshCookieOptions,
    maxAge: Math.min(remainingMs, maximumMs),
  });
}

export function readRefreshCookie(
  req: Request
): unknown {
  return req.cookies?.[REFRESH_COOKIE_NAME];
}

export function clearRefreshCookie(
  res: Response
): void {
  res.clearCookie(
    REFRESH_COOKIE_NAME,
    refreshCookieOptions
  );
}