import { SignJWT, jwtVerify } from "jose";

import { env } from "../../config/env.js";
import { ApiError } from "../../middleware/error-handler.js";

const jwtKey = Buffer.from(env.JWT_SECRET, "base64url");

if (
  jwtKey.length !== 32 ||
  jwtKey.toString("base64url") !== env.JWT_SECRET
) {
  throw new Error("Invalid JWT signing key configuration");
}

interface AccessTokenIdentity {
  userId: string;
  sessionId: string;
}

export async function signAccessToken({
  userId,
  sessionId,
}: AccessTokenIdentity) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + env.ACCESS_TOKEN_TTL_SECONDS;

  const accessToken = await new SignJWT({
    sid: sessionId,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(jwtKey);

  return {
    accessToken,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenIdentity> {
  try {
    const { payload } = await jwtVerify(token, jwtKey, {
      algorithms: ["HS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      typ: "JWT",
      requiredClaims: ["sub", "sid", "iat", "exp"],
    });

    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.sid !== "string" ||
      !payload.sid
    ) {
      throw new Error("Invalid access token claims");
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  } catch {
    throw new ApiError(
      401,
      "AUTH_INVALID_TOKEN",
      "Invalid or expired access token."
    );
  }
}