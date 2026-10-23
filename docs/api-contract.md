# API Contract — Authentication & Authorization Module

## Base URL

All endpoints use the `/api` prefix.

Development:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Browser requests: `/api` through Vite proxy

## Successful Responses

Successful endpoints return their documented response DTO.

Example:

GET /api/health

Status: 200

Response:
{ "status": "ok" }

No universal success wrapper is required.

## Error Responses

All API errors use:

{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested endpoint was not found."
  }
}

Validation errors may include safe field-level details.

## HTTP Status Conventions

- 200: Successful request
- 201: Resource created
- 204: Successful operation without response body
- 400: Invalid request
- 401: Unauthenticated or invalid authentication
- 403: Authenticated but insufficient permission
- 404: Resource not found
- 409: Conflict
- 413: Request payload too large
- 429: Rate limited, when implemented
- 500: Unexpected server failure

## Planned API Endpoints

| Method | Endpoint | Responsibility |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/auth/login | Authenticate user |
| POST | /api/auth/refresh | Refresh authentication |
| POST | /api/auth/logout | Revoke session |
| GET | /api/auth/me | Current user |
| GET | /api/resources | List resources |
| POST | /api/resources | Create resource |
| PATCH | /api/resources/:id | Update resource |
| DELETE | /api/resources/:id | Delete resource |
| GET | /api/users | Admin-only user listing |

## Current Implementation Status

Phase 02:
- Health endpoint implemented
- Centralized error handling implemented
- Axios client configured
- API error normalization configured
- TanStack Query configured
- Typed health service and hook created

Authentication and protected resource endpoints
are not yet implemented.

## Security Rules

- Backend enforces authentication and authorization.
- Access tokens will be kept in frontend memory.
- Refresh tokens will use HttpOnly cookies.
- Protected backend operations must validate sessions.
- Permissions must be verified server-side.
- Password hashes and refresh credentials must
  never be exposed in API responses.
- Authentication credentials must never be logged.