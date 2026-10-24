import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  DATABASE_FILE: z.string().trim().min(1).default("./data/auth.db"),

  JWT_SECRET: z
    .string()
    .regex(
      /^[A-Za-z0-9_-]{43}$/,
      "JWT_SECRET must be a base64url-encoded 32-byte key",
    ),

  JWT_ISSUER: z.string().min(1).default("auth-authorization-assignment"),

  JWT_AUDIENCE: z.string().min(1).default("auth-authorization-frontend"),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(30)
    .max(3600)
    .default(600),

  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(7).default(7),

  TRUSTED_ORIGIN: z
    .string()
    .url()
    .refine(
      (value) => new URL(value).origin === value,
      "Must be an exact origin without a path or trailing slash",
    ),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );

  throw new Error("Backend environment validation failed");
}

export const env = result.data;
