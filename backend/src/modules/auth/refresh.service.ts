import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../../db/index.js";
import { sessions, users } from "../../db/schema.js";
import { ApiError } from "../../middleware/error-handler.js";

import { signAccessToken } from "./jwt.js";
import { getPermissions } from "./permissions.js";
import {
  createRefreshCredential,
  parseRefreshCredential,
  verifyRefreshCredential,
} from "./refresh-token.js";

function invalidSession(): ApiError {
  return new ApiError(
    401,
    "AUTH_SESSION_INVALID",
    "Session is invalid or has expired."
  );
}

// Detect reuse of the immediately preceding refresh credential.
function rejectReplay(
  sessionId: string,
  verifier: string
): never {
  const session = db
    .select({
      previousHash: sessions.previousRefreshTokenHash,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .get();

  if (
    session?.previousHash &&
    verifyRefreshCredential(verifier, session.previousHash)
  ) {
    // Strict policy: revoke when the previous token is reused.
    db.update(sessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(
            sessions.previousRefreshTokenHash,
            session.previousHash
          ),
          isNull(sessions.revokedAt)
        )
      )
      .run();
  }

  throw invalidSession();
}

export async function refreshSession(
  rawCredential: unknown
) {
  const credential = parseRefreshCredential(rawCredential);

  if (!credential) {
    throw invalidSession();
  }

  const session = db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      role: users.role,
      refreshTokenHash: sessions.refreshTokenHash,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, credential.sessionId))
    .get();

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt <= new Date()
  ) {
    throw invalidSession();
  }

  // Only the current credential may renew authentication.
  if (
    !verifyRefreshCredential(
      credential.verifier,
      session.refreshTokenHash
    )
  ) {
    rejectReplay(credential.sessionId, credential.verifier);
  }

  const replacement = createRefreshCredential(
    session.sessionId
  );

  // Generate JWT before changing the stored refresh credential.
  const { accessToken, expiresAt } = await signAccessToken({
    userId: session.userId,
    sessionId: session.sessionId,
  });

  // Compare-and-swap: only one concurrent rotation can succeed.
  const rotated = db
    .update(sessions)
    .set({
      previousRefreshTokenHash: session.refreshTokenHash,
      refreshTokenHash: replacement.verifierHash,
      rotatedAt: new Date(),
    })
    .where(
      and(
        eq(sessions.id, session.sessionId),
        eq(sessions.refreshTokenHash, session.refreshTokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .returning({ id: sessions.id })
    .get();

  if (!rotated) {
    // Another operation may have rotated or revoked the session.
    rejectReplay(credential.sessionId, credential.verifier);
  }

  return {
    accessToken,
    expiresAt,
    refreshCookie: replacement.cookieValue,
    sessionExpiresAt: session.expiresAt,
    user: {
      id: session.userId,
      email: session.email,
      role: session.role,
      permissions: getPermissions(session.role),
    },
  };
}