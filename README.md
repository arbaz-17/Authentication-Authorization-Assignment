# Authentication & Authorization - Week 13 Assignment

## Overview

A full-stack **Authentication & Authorization Module** developed as part of the **Frontend Engineering Internship Assignment at OptimusFox**.

The application demonstrates secure user authentication, persistent sessions, JWT access-token refresh, protected routes, and Role-Based Access Control (RBAC).

It features a responsive access control portal where **Admin, Manager, and Viewer** accounts have different permissions, enforced by the backend and reflected in the frontend interface.

## Features

- **Authentication:** Login, logout, and secure password verification.
- **Session Management:** Database-backed sessions with expiration and revocation.
- **JWT Authentication:** Short-lived access tokens stored in memory.
- **Token Refresh:** Rotating refresh tokens delivered through HttpOnly cookies.
- **Protected Routes:** Authentication and permission-based navigation.
- **Role-Based Access Control:** Three roles with distinct permissions.
- **Resource Management:** Permission-controlled resource CRUD operations.
- **User Management View:** Admin-only user listing.
- **Error Handling:** Centralized API errors, loading states, and session recovery.
- **Security:** Password hashing, CSRF protection, validation, and rate limiting.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| API Communication | Axios, Interceptors |
| Server State | TanStack Query |
| Forms & Validation | React Hook Form, Zod |
| UI & Styling | Tailwind CSS v4, shadcn/ui, Lucide |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite, Drizzle ORM |
| Authentication | jose (JWT), Argon2id |
| Security | HttpOnly Cookies, RBAC, CSRF Checks, Rate Limiting |

## Project Structure

```text
Authentication-Authorization-Assignment/
├── frontend/                  # React application
│   ├── src/
│   │   ├── api/               # Centralized API client
│   │   ├── components/        # Shared UI and layout
│   │   ├── features/          # Authentication and API services
│   │   ├── lib/               # TanStack Query configuration
│   │   ├── pages/             # Application pages
│   │   └── routes/            # Protected route guards
│   └── README.md
├── backend/                   # Express application
│   ├── drizzle/               # Database migrations
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── db/                # Database schema and seeding
│   │   ├── middleware/        # Authorization, CSRF, errors
│   │   ├── modules/           # Auth, resources, users
│   │   └── routes/            # API route registration
│   └── README.md
├── package.json               # npm workspace configuration
├── package-lock.json
└── README.md
```
## Roles & Permissions

| Permission | Admin | Manager | Viewer |
|---|---|---|---|
| Read Resources | ✅ | ✅ | ✅ |
| Create Resources | ✅ | ✅ | ❌ |
| Update Resources | ✅ | ✅ | ❌ |
| Delete Resources | ✅ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ |

The frontend conditionally displays available actions, while the backend independently enforces all permissions.

## Application Routes

| Route | Access |
|---|---|
| `/login` | Unauthenticated users |
| `/dashboard` | Authenticated users |
| `/resources` | Users with `resource:read` |
| `/users` | Users with `user:manage` |
| `/forbidden` | Authenticated users without required access |

## API Overview

All backend endpoints use the `/api` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke session |
| GET | `/auth/me` | Retrieve current user |
| GET | `/resources` | List resources |
| POST | `/resources` | Create resource |
| PATCH | `/resources/:id` | Update resource |
| DELETE | `/resources/:id` | Delete resource |
| GET | `/users` | List users (Admin only) |
| GET | `/health` | API health check |

## Authentication Flow

1. The user submits login credentials.
2. The backend verifies the password using Argon2id.
3. A server-side session is created in SQLite.
4. The frontend receives a short-lived JWT access token.
5. A rotating refresh credential is delivered through an HttpOnly cookie.
6. On access-token expiry, eligible requests trigger authentication recovery.
7. Logout clears local authentication state and revokes the backend session.

Protected API endpoints validate both the access token and the active database session.

## Security Overview

The implementation includes:

- Argon2id password hashing.
- JWT signature, issuer, audience, and expiration validation.
- In-memory access-token storage.
- HttpOnly refresh cookies with appropriate cookie attributes.
- Hashed refresh-token verifiers and token rotation.
- Server-side session expiration and revocation.
- Trusted-Origin checks for cookie-authenticated requests.
- Backend-enforced RBAC and request validation.
- Login rate limiting and centralized API error handling.

Frontend route guards improve usability but are **not a substitute for backend authorization**.

## Documentation

- **[Frontend README](frontend/README.md)** — React architecture, routing, state management, and UI.
- **[Backend README](backend/README.md)** — Express APIs, database, JWTs, sessions, and security implementation.
- **[Security Review](docs/README.md)**
