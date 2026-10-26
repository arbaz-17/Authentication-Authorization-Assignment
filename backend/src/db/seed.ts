import { randomUUID } from "node:crypto";

import argon2 from "argon2";
import { z } from "zod";

import { env } from "../config/env.js";
import { db, sqlite } from "./index.js";
import { resources, users } from "./schema.js";

type Role = "admin" | "manager" | "viewer";

const seedEnvSchema = z.object({
  SEED_ADMIN_PASSWORD: z.string().min(5),
  SEED_MANAGER_PASSWORD: z.string().min(5),
  SEED_VIEWER_PASSWORD: z.string().min(5),
});

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

async function seed() {
  if (env.NODE_ENV !== "development") {
    throw new Error("Seeding is allowed only in development.");
  }

  const result = seedEnvSchema.safeParse(process.env);

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");

    throw new Error(`Invalid seed password configuration: ${fields}`);
  }

  const passwords = result.data;

  const uniquePasswords = new Set([
    passwords.SEED_ADMIN_PASSWORD,
    passwords.SEED_MANAGER_PASSWORD,
    passwords.SEED_VIEWER_PASSWORD,
  ]);

  if (uniquePasswords.size !== 3) {
    throw new Error("Each demo account must have a different password.");
  }

  const adminId = randomUUID();

  const accounts: {
    id: string;
    email: string;
    role: Role;
    password: string;
  }[] = [
    {
      id: adminId,
      email: "admin@example.test",
      role: "admin",
      password: passwords.SEED_ADMIN_PASSWORD,
    },
    {
      id: randomUUID(),
      email: "manager@example.test",
      role: "manager",
      password: passwords.SEED_MANAGER_PASSWORD,
    },
    {
      id: randomUUID(),
      email: "viewer@example.test",
      role: "viewer",
      password: passwords.SEED_VIEWER_PASSWORD,
    },
  ];

  const hashedAccounts = await Promise.all(
    accounts.map(async ({ id, email, role, password }) => ({
      id,
      email,
      role,
      passwordHash: await argon2.hash(password, hashOptions),
    })),
  );

  db.transaction((tx) => {
    const existingUser = tx.select({ id: users.id }).from(users).limit(1).get();

    const existingResource = tx
      .select({ id: resources.id })
      .from(resources)
      .limit(1)
      .get();

    if (existingUser || existingResource) {
      throw new Error(
        "Seeding stopped: database already contains users " +
          "or resources. Existing records were not changed.",
      );
    }

    tx.insert(users).values(hashedAccounts).run();

    tx.insert(resources)
      .values([
        {
          title: "Operations Handbook",
          description: "General operational documentation and procedures.",
          createdBy: adminId,
        },
        {
          title: "Project Guidelines",
          description: "Project standards and collaboration guidelines.",
          createdBy: adminId,
        },
        {
          title: "Team Resources",
          description: "Shared resources for team members.",
          createdBy: adminId,
        },
      ])
      .run();
  });

  const savedUsers = db
    .select({
      email: users.email,
      role: users.role,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .all();

  for (const account of accounts) {
    const saved = savedUsers.find((user) => user.email === account.email);

    if (
      !saved ||
      saved.role !== account.role ||
      !saved.passwordHash.startsWith("$argon2id$") ||
      !(await argon2.verify(saved.passwordHash, account.password))
    ) {
      throw new Error(`Seed verification failed for ${account.email}`);
    }
  }

  const savedResources = db
    .select({
      title: resources.title,
      createdBy: resources.createdBy,
    })
    .from(resources)
    .all();

  if (
    savedResources.length !== 3 ||
    savedResources.some((resource) => resource.createdBy !== adminId)
  ) {
    throw new Error("Resource seed verification failed.");
  }

  console.log("Development seed completed successfully.");

  console.table(
    savedUsers.map(({ email, role }) => ({
      email,
      role,
    })),
  );

  console.log(`Verified ${savedUsers.length} Argon2id password hashes.`);

  console.log(`Verified ${savedResources.length} demo resources.`);
}

seed()
  .catch((error: unknown) => {
    console.error(
      "Seed failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    process.exitCode = 1;
  })
  .finally(() => {
    sqlite.close();
  });
