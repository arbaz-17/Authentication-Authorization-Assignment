# Users Module

## Overview

This folder contains the frontend API service for retrieving registered users.

It provides a type-safe method for fetching user information from the Express backend. Access to this functionality is restricted to administrators.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `users.service.ts` | Defines user-related types and provides an API method for retrieving registered users. |

## User Types

- **`UserSummary`** — Represents a user returned by the backend, including their ID, email, role, and creation date.
- **`UsersResponse`** — Defines the expected API response containing an array of users.
- **`Role`** — Reuses the shared role type (`admin`, `manager`, `viewer`) from the authentication module.

## API Operations

| Method | Endpoint | Service Method | Required Permission |
|---|---|---|---|
| GET | `/api/users` | `list()` | `user:manage` |

## API Integration

The `list()` method uses the centralized `apiRequest<T>()` helper from `src/api/client.ts`.

This provides consistent HTTP configuration, access-token attachment, authentication recovery, and error handling.

The method also accepts an optional `AbortSignal` for request cancellation.

## Authorization & Security

Only users with the `user:manage` permission can access the users endpoint.

The frontend hides unauthorized navigation and protects the route, while the Express backend enforces the actual permission check.