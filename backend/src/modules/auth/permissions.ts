import type { User } from "../../db/schema.js";

export type Role = User["role"];

export type Permission =
  | "resource:read"
  | "resource:create"
  | "resource:update"
  | "resource:delete"
  | "user:manage";

const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: [
    "resource:read",
    "resource:create",
    "resource:update",
    "resource:delete",
    "user:manage",
  ],

  manager: [
    "resource:read",
    "resource:create",
    "resource:update",
  ],

  viewer: ["resource:read"],
};

export function getPermissions(role: Role): Permission[] {
  return [...rolePermissions[role]];
}