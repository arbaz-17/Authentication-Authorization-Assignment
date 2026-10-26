import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../../db/index.js";
import { sessions } from "../../db/schema.js";

import {
  parseRefreshCredential,
  verifyRefreshCredential,
} from "./refresh-token.js";

export function revokeSession(
  rawCredential: unknown
): boolean {
  const credential = parseRefreshCredential(rawCredential);

  if (!credential) {
    return false;
  }

  const session = db
    .select({
      refreshTokenHash: sessions.refreshTokenHash,
      previousRefreshTokenHash: sessions.previousRefreshTokenHash,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
    })
    .from(sessions)
    .where(eq(sessions.id, credential.sessionId))
    .get();

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt <= new Date()
  ) {
    return false;
  }

  const matchesCurrent = verifyRefreshCredential(
    credential.verifier,
    session.refreshTokenHash
  );

  const matchesPrevious =
    session.previousRefreshTokenHash !== null &&
    verifyRefreshCredential(
      credential.verifier,
      session.previousRefreshTokenHash
    );

  if (!matchesCurrent && !matchesPrevious) {
    return false;
  }

  // Require the specific matched credential to remain stored.
  const hashCondition = matchesCurrent
    ? eq(
        sessions.refreshTokenHash,
        session.refreshTokenHash
      )
    : eq(
        sessions.previousRefreshTokenHash,
        session.previousRefreshTokenHash!
      );

  const revoked = db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sessions.id, credential.sessionId),
        hashCondition,
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .returning({ id: sessions.id })
    .get();

  return Boolean(revoked);
}