# Shared Library

## Overview

This folder contains shared frontend configuration and utilities used across the application.

Currently, it provides the TanStack Query client responsible for managing server-state caching and request behavior.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `query-client.ts` | Creates and configures the shared TanStack Query `QueryClient` instance. |

## Query Client Configuration

The application uses a single `QueryClient` with the following default settings:

| Setting | Value | Purpose |
|---|---|---|
| Query retry | `false` | Disables automatic retries for failed queries. |
| Stale time | `30 seconds` | Considers fetched data fresh for 30 seconds. |
| Mutation retry | `false` | Prevents automatic retries of failed mutations. |

These settings provide predictable API behavior and avoid unnecessary repeated requests.

## Integration

The shared `queryClient` is provided to the React application through `QueryClientProvider`.

Feature pages use TanStack Query hooks to manage server data:

- **`useQuery`** — Fetches and caches resources and users.
- **`useMutation`** — Performs resource creation, updates, and deletion.
- **Query invalidation** — Refreshes cached resource data after successful mutations.