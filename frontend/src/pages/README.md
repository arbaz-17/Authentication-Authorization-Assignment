# Application Pages

## Overview

This folder contains the main page components of the Authentication & Authorization application.

Each page provides a user interface for authentication, account information, resource management, or access control.

Business logic, API communication, and authentication state management are handled by their respective feature modules.

## Files & Responsibilities

| File | Responsibility |
|---|---|
| `DashboardPage.tsx` | Displays authenticated user information, account role, and assigned permissions. |
| `ForbiddenPage.tsx` | Displays an access-denied message when a user lacks the required permission. |
| `LoginPage.tsx` | Provides the login form, validation, error messages, and demo-account selection. |
| `ResourcesPage.tsx` | Displays resources and provides permission-based create, edit, and delete actions. |
| `UsersPage.tsx` | Displays registered users and their roles for administrators. |

## Routing & Access Control

Pages are rendered through React Router, with authentication and permission checks applied through route guards.

| Route | Page | Access |
|---|---|---|
| `/login` | `LoginPage` | Unauthenticated users |
| `/dashboard` | `DashboardPage` | Authenticated users |
| `/resources` | `ResourcesPage` | `resource:read` |
| `/users` | `UsersPage` | `user:manage` |
| `/forbidden` | `ForbiddenPage` | Authenticated users |

## State & API Integration

- **Authentication:** `LoginPage` and `DashboardPage` integrate with the authentication module.
- **Resources:** `ResourcesPage` uses TanStack Query and the resources service for CRUD operations.
- **Users:** `UsersPage` uses TanStack Query and the users service to retrieve user information.
- **Error handling:** Pages display loading, validation, empty, and error states where applicable.

## Security Considerations

Frontend route guards and permission-based controls improve usability but do not replace backend authorization.

The Express backend independently validates authentication and permissions for protected API operations.