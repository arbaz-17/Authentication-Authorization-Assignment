import { randomUUID } from "node:crypto";

import argon2 from "argon2";
import { sql } from "drizzle-orm";

import { env } from "../../config/env.js";
import { db } from "../../db/index.js";
import { sessions, users } from "../../db/schema.js";
import { ApiError } from "../../middleware/error-handler.js";

import { signAccessToken } from "./jwt.js";
import { getPermissions } from "./permissions.js";
import { createRefreshCredential } from "./refresh-token.js";

// A precomputed Argon2id hash for unknown-account verification.
// It is NOT a real account's password hash.
const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$" +
  "yPeyMErBqyuQ9cX6UmPh9Q$" +
  "WYwLAkR4HJX73dArh8qnZWD4TH53aRRe57h+C0/bf9I";

export async function loginUser(
  email: string,
  password: string
) {
  // Fetch only the fields required for authentication.
  const user = db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .get();

  // Perform password verification even for unknown accounts.
  // This helps reduce account-enumeration timing differences.
  const hashToVerify =
    user?.passwordHash ?? DUMMY_PASSWORD_HASH;

  const passwordValid = await argon2.verify(
    hashToVerify,
    password
  );

  if (!user || !passwordValid) {
    throw new ApiError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Invalid email or password."
    );
  }

  // Establish a new database-backed session.
  const sessionId = randomUUID();

  const sessionExpiresAt = new Date(
    Date.now() +
      env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const refreshCredential = createRefreshCredential(
    sessionId
  );

  // Generate the JWT before inserting the session.
  // No credentials are returned if persistence fails.
  const { accessToken, expiresAt } =
    await signAccessToken({
      userId: user.id,
      sessionId,
    });

  // A single database insert is atomic.
  db.insert(sessions)
    .values({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: refreshCredential.verifierHash,
      expiresAt: sessionExpiresAt,
    })
    .run();

  return {
    accessToken,
    expiresAt,
    refreshCookie: refreshCredential.cookieValue,
    sessionExpiresAt,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: getPermissions(user.role),
    },
  };
}