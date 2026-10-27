# Resources Module

## Overview

This folder contains the frontend API service for managing resources.

It provides type-safe methods for retrieving, creating, updating, and deleting resources through the Express backend.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `resources.service.ts` | Defines resource types and provides CRUD operations using the centralized API client. |

## Resource Types

- **`Resource`** — Represents a resource returned by the backend, including its ID, title, description, creator, and timestamps.
- **`ResourceInput`** — Defines the title and description required when creating or updating a resource.
- **Response interfaces** — Describe the expected API response structures.

## API Operations

| Method | Endpoint | Service Method | Required Permission |
|---|---|---|---|
| GET | `/api/resources` | `list()` | `resource:read` |
| POST | `/api/resources` | `create()` | `resource:create` |
| PATCH | `/api/resources/:id` | `update()` | `resource:update` |
| DELETE | `/api/resources/:id` | `remove()` | `resource:delete` |

## Authorization

The frontend uses permissions to control which resource actions are displayed.

Actual authorization is enforced by the Express backend, ensuring that users cannot bypass restrictions by sending API requests directly.