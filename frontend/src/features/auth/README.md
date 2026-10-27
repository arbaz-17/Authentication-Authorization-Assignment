# Authentication Module

## Overview

This folder manages frontend authentication, including login, logout, session restoration, token refresh, and authentication state.

It connects the React application to the backend authentication APIs while keeping access tokens in memory and protecting user-specific application state.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `auth.context.ts` | Defines authentication states, context, and the `useAuth()` hook. |
| `auth.service.ts` | Handles login, refresh, logout, and current-user API requests. |
| `auth.types.ts` | Defines roles, permissions, users, credentials, and API response types. |
| `AuthProvider.tsx` | Manages authentication state, session restoration, logout, and refresh recovery. |
| `token-store.ts` | Stores the access token in memory and tracks authentication lifecycle changes. |

## Authentication State

The `AuthProvider` manages five authentication states:

| State | Meaning |
|---|---|
| `loading` | Checking or restoring authentication. |
| `authenticated` | User is authenticated. |
| `unauthenticated` | No authenticated session is available. |
| `expired` | Session recovery was rejected. |
| `unavailable` | Session verification or logout could not be confirmed. |

Components access authentication state and actions through `useAuth()`.

## Authentication Flow

1. **Login:** Credentials are submitted to the backend for verification.
2. **Session creation:** The backend returns an access token and authenticated user information.
3. **Token storage:** The access token is stored in JavaScript memory.
4. **Session restoration:** On application load, the provider attempts authentication recovery through the refresh endpoint.
5. **Token refresh:** Concurrent refresh requests are coordinated within the current browser runtime.
6. **Logout:** Local authentication and cached queries are cleared, followed by backend session revocation.


## Security Considerations

- Access tokens are stored in memory, not Local Storage or Session Storage.
- Refresh credentials are managed through backend-set HttpOnly cookies.
- Authentication lifecycle tracking helps prevent stale requests from restoring cleared tokens.
- User-specific TanStack Query caches are cleared during authentication changes.
- Session restoration distinguishes rejected credentials from temporary connection failures.
- Backend session validation and authorization remain the security boundaries.