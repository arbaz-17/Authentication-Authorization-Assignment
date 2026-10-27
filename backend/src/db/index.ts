import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

const databasePath = resolve(process.cwd(), env.DATABASE_FILE);

mkdirSync(dirname(databasePath), {
  recursive: true,
});

export const sqlite = new Database(databasePath);

sqlite.pragma("foreign_keys = ON");

sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, {
  schema,
});
