# Security Review — Authentication & Authorization

## 1. Overview

The application demonstrates a security-focused authentication and authorization workflow with three roles: **Admin**, **Manager**, and **Viewer**. The frontend manages the user experience; the backend validates identity, active sessions, and permissions.

This review describes the implemented protections, the threats they address, the available verification evidence, and known limitations.

## 2. Architecture & Trust Boundaries

```text
Browser (React)
  ├── JWT access token: JavaScript memory only
  ├── Refresh credential: browser-managed HttpOnly cookie
  └── /api requests → Vite proxy (development) → Express
                                             ├── Auth / permissions middleware
                                             ├── Login / refresh / logout services
                                             └── Drizzle → SQLite
```

- **Browser:** An untrusted client; hidden buttons and route guards do not enforce security.
- **Express:** The authorization boundary. Protected requests require a valid Bearer JWT and an active database session.
- **SQLite:** Stores password hashes, refresh-token verifier hashes, roles, sessions, and resources.
- **Secrets:** The JWT signing key and demo seed passwords are backend environment configuration, not frontend environment variables.

## 3. Authentication Security

- Passwords are verified using **Argon2id**; plaintext passwords are not stored in the database.
- Login returns a generic invalid-credentials response for unknown accounts and incorrect passwords.
- Login attempts are rate-limited to **10 failed attempts per 15 minutes**, using the configured in-memory limiter.
- Access JWTs are signed using **HS256** and validated for algorithm, signature, issuer, audience, `sub`, `sid`, issued-at time, and expiry.
- Access tokens normally expire after **10 minutes**.
- Every protected API request checks that its session still exists, has not been revoked, and has not expired; a cryptographically valid JWT alone is insufficient.

## 4. Access Token, Refresh Cookie & Session Security

- Access tokens remain **in JavaScript memory**, not Local Storage or Session Storage.
- Refresh credentials contain a session ID plus a cryptographically random 32-byte verifier. Only its **SHA-256 hash** is stored in SQLite.
- The refresh cookie uses **HttpOnly**, **SameSite=Lax**, and **Path=/api/auth**. The **Secure** flag is enabled in production mode, assuming HTTPS is correctly configured.
- Refresh rotates the stored verifier and sets a replacement cookie. Rotation does **not** extend the session's absolute lifetime (maximum **7 days**).
- Reuse of the immediately previous refresh credential is treated as a replay signal and triggers session revocation.
- Logout revokes the database session and clears the refresh cookie. An access JWT tied to a revoked session is rejected by protected APIs.
- The frontend clears in-memory access state and cached user-specific queries when authentication changes.

## 5. Authorization & RBAC

The backend derives permissions from the user's **current database role** rather than trusting client-supplied roles or permissions.

| Permission | Admin | Manager | Viewer |
|---|:---:|:---:|:---:|
| `resource:read` | Yes | Yes | Yes |
| `resource:create` | Yes | Yes | No |
| `resource:update` | Yes | Yes | No |
| `resource:delete` | Yes | No | No |
| `user:manage` | Yes | No | No |

- `requireAuth` validates the Bearer token and active session.
- `requirePermission` enforces permissions on the relevant resource and users endpoints.
- Missing or invalid authentication returns **401**; authenticated users lacking permission receive **403**.
- React route guards and conditional controls improve usability, but **backend authorization is the security boundary**.
- Resource creator identity is taken from the authenticated session, not the request body. The users endpoint selects only non-sensitive user fields.

## 6. Browser, API & Secret Protection

| Area | Implemented approach | Remaining consideration |
|---|---|---|
| **XSS** | React text rendering escapes ordinary values; JWTs are not persisted in browser storage. | XSS can still act as the current user; no independently verified CSP or XSS audit. |
| **CSRF** | Cookie-authenticated login, refresh, and logout endpoints require a matching trusted `Origin`, or matching `Referer` when Origin is absent. SameSite=Lax provides additional protection. | Depends on correctly configured trusted origin and browser/proxy behavior; not a substitute for broader security assessment. |
| **CORS** | Local development sends `/api` requests through a same-origin Vite proxy; permissive CORS is not enabled in the reviewed Express app. | A cross-origin deployment would need an explicit reviewed CORS policy. |
| **Input validation** | Zod validates login and resource payloads; IDs are checked; JSON bodies have a 16 KB size limit. | Validation does not replace broader misuse and abuse testing. |
| **API errors** | Consistent error objects; unexpected internal details are hidden from HTTP clients. | Development stack-trace logging may expose sensitive data in developer logs. |
| **Secrets** | Backend validates `JWT_SECRET`; `.env` should be Git-ignored and not exposed by the frontend. | Review deployment secrets and rotate any shared credentials. |
| **Response data** | Authentication responses exclude password and refresh-token hashes; selected protected reads use `Cache-Control: no-store`. | Verify all deployment intermediaries and logs. |

## 7. Threats, Mitigations & Residual Risks

| Threat | Defense | Residual risk |
|---|---|---|
| Credential guessing | Argon2id, generic login errors, login limiter | In-memory rate limit is not shared across deployments. |
| JWT tampering or expired JWT | `jose` signature/claim validation and short TTL | A stolen unexpired token could be used until session revocation/expiry. |
| Stolen refresh credential | HttpOnly cookie, hashed verifier, rotation | Cookie theft or compromised browser may still permit session abuse. |
| Refresh-token replay | Previous-verifier detection and session revocation | Legitimate multi-tab races can also revoke the session. |
| Unauthorized CRUD | Server-side RBAC on protected APIs | Incorrect future route configuration could introduce gaps. |
| CSRF | Exact trusted-origin checks on cookie-authenticated mutations | Production origin/cookie settings require deployment validation. |
| Data leakage between users | Query cache clearing on auth changes | Shared-browser and browser-extension threats are not fully eliminated. |

## 9. Conclusion

The implementation covers the assignment's main authentication and authorization security controls: password hashing, short-lived JWTs, rotating refresh credentials, database-backed sessions, logout revocation, trusted-origin protection, and server-enforced RBAC.