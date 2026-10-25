import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VERIFIER_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

export interface ParsedRefreshCredential {
  sessionId: string;
  verifier: string;
}

function hashVerifier(verifier: string): string {
  return createHash("sha256")
    .update(verifier, "utf8")
    .digest("hex");
}

export function createRefreshCredential(sessionId: string) {
  if (!UUID_PATTERN.test(sessionId)) {
    throw new Error("Invalid session identifier");
  }

  const verifier = randomBytes(32).toString("base64url");

  return {
    cookieValue: `${sessionId}.${verifier}`,
    verifierHash: hashVerifier(verifier),
  };
}

export function parseRefreshCredential(
  value: unknown
): ParsedRefreshCredential | null {
  if (typeof value !== "string") {
    return null;
  }

  const parts = value.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [sessionId, verifier] = parts;

  if (
    !sessionId ||
    !verifier ||
    !UUID_PATTERN.test(sessionId) ||
    !VERIFIER_PATTERN.test(verifier)
  ) {
    return null;
  }

  return { sessionId, verifier };
}

export function verifyRefreshCredential(
  verifier: string,
  storedHash: string
): boolean {
  if (
    !VERIFIER_PATTERN.test(verifier) ||
    !HASH_PATTERN.test(storedHash)
  ) {
    return false;
  }

  const actual = Buffer.from(
    hashVerifier(verifier),
    "hex"
  );

  const expected = Buffer.from(storedHash, "hex");

  return timingSafeEqual(actual, expected);
}