/// <reference types="node" />

import "dotenv/config";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

const databaseFile =
  process.env.DATABASE_FILE || "./data/auth.db";

const databasePath = resolve(
  process.cwd(),
  databaseFile
);

mkdirSync(dirname(databasePath), {
  recursive: true,
});

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databasePath,
  },
});