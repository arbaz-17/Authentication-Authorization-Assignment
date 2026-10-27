# Backend — Authentication & Authorization

## Overview

This backend is part of the **Week 13 Authentication & Authorization Assignment** for the Frontend Engineering Internship at OptimusFox.

Built with Node.js, Express, and TypeScript, it provides secure authentication, session management, refresh-token rotation, and role-based access control (RBAC).

The backend serves REST APIs consumed by a separate React frontend and acts as the security boundary for protected operations.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server and middleware |
| TypeScript | Type safety and maintainability |
| SQLite + better-sqlite3 | Persistent database |
| Drizzle ORM + Drizzle Kit | Database queries, schema, and migrations |
| jose | JWT signing and verification |
| Argon2id | Password hashing and verification |
| Zod | Environment and request validation |
| cookie-parser | Reading authentication cookies |
| express-rate-limit | Login rate limiting |

## Features

- Login with Argon2id password verification.
- Short-lived JWT access tokens.
- Persistent server-side authentication sessions.
- Refresh-token rotation with replay detection.
- Session restoration and expiration handling.
- Logout with server-side session revocation.
- Three roles: Admin, Manager, and Viewer.
- Permission-protected resource CRUD operations.
- Admin-only users endpoint.
- Request validation, rate limiting, and centralized error handling.

## Project Structure

```text
backend/
├── data/                         # Local SQLite database
├── drizzle/                      # SQL migrations and metadata
├── src/
│   ├── config/
│   │   └── env.ts                # Environment validation
│   ├── db/
│   │   ├── index.ts              # Database connection
│   │   ├── schema.ts             # Database tables and types
│   │   └── seed.ts               # Development seed data
│   ├── middleware/
│   │   ├── authorize.ts          # Permission enforcement
│   │   ├── csrf.ts               # Trusted-Origin checks
│   │   └── error-handler.ts      # API error handling
│   ├── modules/
│   │   ├── auth/                 # Authentication and sessions
│   │   ├── resources/            # Protected resource CRUD
│   │   └── users/                # Admin-only users endpoint
│   ├── routes/
│   │   └── api.routes.ts         # API route registration
│   ├── app.ts                    # Express configuration
│   └── server.ts                 # HTTP server entry point
├── .env.example                  # Environment template
├── drizzle.config.ts             # Drizzle Kit configuration
├── package.json
└── tsconfig.json
```

## Application Architecture

The backend follows a modular architecture with clear responsibilities:

1. **Routes** receive HTTP requests and return API responses.
2. **Middleware** validates authentication, permissions, and trusted origins.
3. **Authentication services** handle login, refresh rotation, and logout.
4. **Drizzle ORM** performs database operations.
5. **SQLite** stores users, sessions, and resources.
6. **Centralized error handling** returns consistent API errors.

The Express application is configured in `app.ts`, while `server.ts` starts the HTTP server.

### Environment Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Application environment |
| `PORT` | Express server port (default: `4000`) |
| `DATABASE_FILE` | SQLite database path |
| `JWT_SECRET` | Base64url-encoded 32-byte signing key |
| `JWT_ISSUER` | Expected JWT issuer |
| `JWT_AUDIENCE` | Expected JWT audience |
| `ACCESS_TOKEN_TTL_SECONDS` | Access-token lifetime (default: `600`) |
| `SESSION_TTL_DAYS` | Maximum session lifetime (default: `7`) |
| `TRUSTED_ORIGIN` | Allowed frontend origin for cookie-authenticated requests |
| `SEED_ADMIN_PASSWORD` | Development Admin password |
| `SEED_MANAGER_PASSWORD` | Development Manager password |
| `SEED_VIEWER_PASSWORD` | Development Viewer password |

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate and create a session |
| POST | `/auth/refresh` | Rotate refresh credentials and issue a new access token |
| POST | `/auth/logout` | Revoke the refresh session |
| GET | `/auth/me` | Retrieve the authenticated user |

### Resources

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/resources` | `resource:read` |
| POST | `/resources` | `resource:create` |
| PATCH | `/resources/:id` | `resource:update` |
| DELETE | `/resources/:id` | `resource:delete` |

### Users & System

| Method | Endpoint | Access |
|---|---|---|
| GET | `/users` | `user:manage` |
| GET | `/health` | Public health check |

The users endpoint returns selected account fields without exposing password hashes or session credentials.

## Authentication Flow

### Login

1. The client submits email and password.
2. Zod validates the request.
3. Argon2id verifies the stored password hash.
4. A server-side session is created in SQLite.
5. A signed JWT access token is returned.
6. An opaque refresh credential is delivered through an HttpOnly cookie.

### Token Refresh

1. The browser sends the refresh cookie.
2. The backend validates the credential and active session.
3. The refresh-token verifier is rotated in SQLite.
4. A new access token and refresh cookie are issued.
5. Reuse of the immediately previous refresh credential triggers session revocation.

Refresh rotation does not extend the session's absolute expiration time.

### Logout

1. The backend validates the refresh credential.
2. The corresponding session is revoked.
3. The refresh cookie is cleared.
4. Previously issued JWTs are rejected by protected endpoints because their session is no longer active.

## JWT & Session Security

Access tokens are signed using HS256 and contain the user ID (`sub`) and session ID (`sid`), along with issuer, audience, issue time, and expiration claims.

Protected requests validate both the JWT and the current database session.

Refresh credentials are randomly generated and stored as SHA-256 hashes in SQLite.

The refresh cookie uses:

- `HttpOnly` to prevent direct JavaScript access.
- `SameSite=Lax` to restrict cross-site cookie behavior.
- `Path=/api/auth` to limit cookie scope.
- `Secure` when running in production mode.

## Role-Based Access Control

The application supports three roles with fixed permissions:

| Permission | Admin | Manager | Viewer |
|---|---|---|---|
| `resource:read` | Yes | Yes | Yes |
| `resource:create` | Yes | Yes | No |
| `resource:update` | Yes | Yes | No |
| `resource:delete` | Yes | No | No |
| `user:manage` | Yes | No | No |

### Authorization Middleware

- **`requireAuth`** validates the Bearer token and active database session.
- **`requirePermission`** checks the authenticated user's current permissions.

Permissions are derived from the user's database role rather than trusted from client input.

All protected resource operations enforce authorization on the backend, independently of frontend UI controls.

Common HTTP statuses include:

| Status | Meaning |
|---|---|
| `400` | Invalid request data |
| `401` | Missing, invalid, or expired authentication |
| `403` | Insufficient permissions or untrusted request origin |
| `404` | Resource or endpoint not found |
| `413` | Request payload too large |
| `429` | Login rate limit exceeded |
| `500` | Unexpected server error |

Unexpected internal errors are not exposed in API responses.

## Security Measures

- Argon2id password hashing.
- JWT signature, issuer, audience, and expiry validation.
- Database-backed session validation and revocation.
- Refresh-token rotation and replay detection.
- HttpOnly refresh cookies with production Secure settings.
- Trusted-Origin validation for login, refresh, and logout.
- Login rate limiting (10 failed attempts per 15-minute window).
- Restricted JSON body size (16 KB).
- Input validation and consistent error responses.
- Sensitive credentials excluded from protected API responses.
- Demo seeding disabled outside development.

This backend demonstrates authentication and authorization as a complete server-enforced system, while keeping the implementation focused on the Week 13 assignment requirements.