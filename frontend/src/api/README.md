# API Layer

## Overview

This folder contains the centralized HTTP client and error-handling utilities used by the frontend.

It provides a consistent way to communicate with the Express backend, attach access tokens, handle API failures, and recover from expired authentication.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `client.ts` | Configures Axios, request/response interceptors, access-token attachment, authentication recovery, and typed API requests. |
| `errors.ts` | Defines `ApiClientError` and converts Axios failures into consistent application errors. |

## API Client

The shared `apiClient` uses the following configuration:

- **Base URL:** `/api`
- **Timeout:** 90 seconds
- **Authentication:** JWT access token attached through the `Authorization: Bearer` header
- **Response handling:** Centralized `401` recovery and request retries

The `apiRequest<T>()` helper returns typed response data and normalizes errors before passing them to feature services.

## Authentication & Token Refresh

When a protected request returns `401`:

1. The client checks whether the request is eligible for recovery.
2. It calls the refresh handler registered by `AuthProvider`.
3. A successful refresh updates the in-memory access token.
4. Safe read-only requests (`GET`, `HEAD`, `OPTIONS`) are retried once.
5. Mutating requests are **not automatically replayed**. They return `ACTION_RETRY_REQUIRED` after successful renewal.

The client also uses an authentication epoch and a retry flag to help prevent stale authentication recovery and repeated retries.

Refresh coordination is handled by the authentication service, not by this folder.

## Error Handling

`normalizeApiError()` provides consistent handling for:

| Error type | Error code |
|---|---|
| Cancelled request | `REQUEST_CANCELLED` |
| Network failure | `NETWORK_ERROR` |
| Request timeout | `REQUEST_TIMEOUT` |
| HTTP error without a backend code | `HTTP_ERROR` |

When available, the backend's error code, message, and HTTP status are preserved.

## Security Considerations

- Access tokens are read from JavaScript memory, not browser storage.
- Requests from an outdated authentication lifecycle cannot restore a cleared access token.
- Read-only requests are retried at most once following a `401`.
- Mutating requests require an explicit retry after token renewal.
- Authentication endpoints use a separate client to avoid recursive refresh handling.