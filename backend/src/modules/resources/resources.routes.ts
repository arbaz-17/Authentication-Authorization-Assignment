import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db/index.js";
import { resources } from "../../db/schema.js";

import { requireAuth } from "../auth/auth.middleware.js";

import { requirePermission } from "../../middleware/authorize.js";
import { ApiError } from "../../middleware/error-handler.js";

export const resourcesRouter = Router();

// Every resource endpoint requires authentication.
resourcesRouter.use(requireAuth);

const createSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    description: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),
  })
  .strict();

const updateSchema = createSchema
  .partial()
  .refine(
    (data) => Object.values(data).some(
      (value) => value !== undefined
    ),
    "Provide at least one field to update."
  );

function parseResourceId(value: unknown): string {
  const result = z.uuid().safeParse(value);

  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Invalid resource ID."
    );
  }

  return result.data;
}

// GET /api/resources
resourcesRouter.get(
  "/",
  requirePermission("resource:read"),
  (_req, res) => {
    const items = db
      .select()
      .from(resources)
      .orderBy(desc(resources.createdAt))
      .all();

    res.set("Cache-Control", "no-store");

    res.status(200).json({
      resources: items,
    });
  }
);

// POST /api/resources
resourcesRouter.post(
  "/",
  requirePermission("resource:create"),
  (req, res) => {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid resource data."
      );
    }

    const auth = res.locals.auth;

    if (!auth) {
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Authentication is required."
      );
    }

    const resource = db
      .insert(resources)
      .values({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        createdBy: auth.id,
      })
      .returning()
      .get();

    res.status(201).json({
      resource,
    });
  }
);

// PATCH /api/resources/:id
resourcesRouter.patch(
  "/:id",
  requirePermission("resource:update"),
  (req, res) => {
    const id = parseResourceId(req.params.id);
    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid resource update."
      );
    }

    const updated = db
      .update(resources)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning()
      .get();

    if (!updated) {
      throw new ApiError(
        404,
        "RESOURCE_NOT_FOUND",
        "Resource not found."
      );
    }

    res.status(200).json({
      resource: updated,
    });
  }
);

// DELETE /api/resources/:id
resourcesRouter.delete(
  "/:id",
  requirePermission("resource:delete"),
  (req, res) => {
    const id = parseResourceId(req.params.id);

    const deleted = db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning({
        id: resources.id,
      })
      .get();

    if (!deleted) {
      throw new ApiError(
        404,
        "RESOURCE_NOT_FOUND",
        "Resource not found."
      );
    }

    res.status(204).send();
  }
);