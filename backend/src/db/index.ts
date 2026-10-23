import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

const databasePath = resolve(
  process.cwd(),
  env.DATABASE_FILE
);

// Ensure the database directory exists.
mkdirSync(dirname(databasePath), {
  recursive: true,
});

// Open or create the SQLite database.
export const sqlite = new Database(databasePath);

// Enforce foreign key constraints.
sqlite.pragma("foreign_keys = ON");

// Enable Write-Ahead Logging.
sqlite.pragma("journal_mode = WAL");

// Initialize the type-safe Drizzle ORM instance.
export const db = drizzle(sqlite, {
  schema,
});