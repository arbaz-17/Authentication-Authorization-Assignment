# Routes

## Overview

This folder contains reusable route guards that control access to protected pages in the React application.

The guards use the current authentication state and user permissions to determine whether a page can be accessed.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `RouteGuards.tsx` | Provides authentication and permission-based route protection using React Router. |

## Route Guards

### RequireAuth

Restricts access to authenticated users.

- Authenticated users can access the protected page.
- Unauthenticated users are redirected to `/login`.
- Authorized nested routes are rendered through React Router's `<Outlet />`.

### RequirePermission

Restricts access based on a specific permission.

- Unauthenticated users are redirected to `/login`.
- Authenticated users without the required permission are redirected to `/forbidden`.
- Users with the required permission can access the protected page.

## Integration

Route guards are configured in `src/App.tsx` and use the `useAuth()` hook to access authentication state and user permissions.

Examples of protected routes:

| Route | Guard | Required Permission |
|---|---|---|
| `/dashboard` | `RequireAuth` | Authenticated user |
| `/resources` | `RequirePermission` | `resource:read` |
| `/users` | `RequirePermission` | `user:manage` |

## Security Considerations

Route guards improve navigation and prevent unauthorized pages from rendering in the frontend.

However, frontend route protection is not a security boundary. The Express backend independently validates access tokens, active sessions, and permissions for protected API requests.