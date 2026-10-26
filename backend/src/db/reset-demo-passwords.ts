import argon2 from "argon2";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { env } from "../config/env.js";
import { db, sqlite } from "./index.js";
import { sessions, users } from "./schema.js";

const schema = z.object({
  SEED_ADMIN_PASSWORD: z.string().min(12),
  SEED_MANAGER_PASSWORD: z.string().min(12),
  SEED_VIEWER_PASSWORD: z.string().min(12),
});

async function main() {
  if (env.NODE_ENV !== "development") {
    throw new Error("Password reset is development-only.");
  }

  const passwords = schema.parse(process.env);

  const accounts = [
    {
      email: "admin@example.test",
      role: "admin",
      password: passwords.SEED_ADMIN_PASSWORD,
    },
    {
      email: "manager@example.test",
      role: "manager",
      password: passwords.SEED_MANAGER_PASSWORD,
    },
    {
      email: "viewer@example.test",
      role: "viewer",
      password: passwords.SEED_VIEWER_PASSWORD,
    },
  ] as const;

  if (new Set(accounts.map((a) => a.password)).size !== 3) {
    throw new Error("Demo passwords must be different.");
  }

  // Hash passwords before starting the SQLite transaction.
  const hashes = await Promise.all(
    accounts.map((account) =>
      argon2.hash(account.password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      })
    )
  );

  db.transaction((tx) => {
    const now = new Date();

    for (const [index, account] of accounts.entries()) {
      const user = tx
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.email, account.email))
        .get();

      if (!user || user.role !== account.role) {
        throw new Error(`Demo account not found: ${account.email}`);
      }

      tx.update(users)
        .set({
          passwordHash: hashes[index],
          updatedAt: now,
        })
        .where(eq(users.id, user.id))
        .run();

      // Invalidate sessions authenticated using old passwords.
      tx.update(sessions)
        .set({ revokedAt: now })
        .where(
          and(
            eq(sessions.userId, user.id),
            isNull(sessions.revokedAt)
          )
        )
        .run();
    }
  });

  console.log("Demo passwords reset successfully.");
  console.log("Existing sessions revoked.");
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Reset failed"
    );
    process.exitCode = 1;
  })
  .finally(() => {
    sqlite.close();
  });