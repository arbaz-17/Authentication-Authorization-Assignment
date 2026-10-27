import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const currentTimestamp = sql`(unixepoch() * 1000)`;

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    email: text("email").notNull(),

    passwordHash: text("password_hash").notNull(),

    role: text("role", {
      enum: ["admin", "manager", "viewer"],
    })
      .notNull()
      .default("viewer"),

    createdAt: integer("created_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(currentTimestamp),

    updatedAt: integer("updated_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(currentTimestamp),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),
    check(
      "users_role_check",
      sql`${table.role} IN ('admin', 'manager', 'viewer')`,
    ),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    refreshTokenHash: text("refresh_token_hash").notNull(),
    previousRefreshTokenHash: text("previous_refresh_token_hash"),

    createdAt: integer("created_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(currentTimestamp),

    rotatedAt: integer("rotated_at", {
      mode: "timestamp_ms",
    }),

    expiresAt: integer("expires_at", {
      mode: "timestamp_ms",
    }).notNull(),

    revokedAt: integer("revoked_at", {
      mode: "timestamp_ms",
    }),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const resources = sqliteTable(
  "resources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    title: text("title").notNull(),

    description: text("description"),

    createdBy: text("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    createdAt: integer("created_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(currentTimestamp),

    updatedAt: integer("updated_at", {
      mode: "timestamp_ms",
    })
      .notNull()
      .default(currentTimestamp),
  },
  (table) => [index("resources_created_by_idx").on(table.createdBy)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
