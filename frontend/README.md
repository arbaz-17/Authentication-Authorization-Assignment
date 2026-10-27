# Frontend — Authentication & Authorization

## Overview

This frontend is part of the **Week 13 Authentication & Authorization Assignment** for the Frontend Engineering Internship.

Built with React and TypeScript, it demonstrates secure authentication flows, session management, protected routes, role-based access control (RBAC), and permission-aware user interfaces.

The frontend communicates with a separate Express backend through a centralized API layer.

## Tech Stack

| Technology | Purpose |
|---|---|
| React + TypeScript | Application development and type safety |
| Vite | Development server and production builds |
| React Router | Routing and protected pages |
| Axios | HTTP requests and interceptors |
| TanStack Query | Server-state management and caching |
| React Hook Form + Zod | Form handling and validation |
| Tailwind CSS v4 | Styling and responsive layouts |
| shadcn/ui + Lucide | Reusable UI components and icons |

## Features

- Login and logout with session management.
- JWT access tokens stored in memory.
- Automatic session restoration and token refresh.
- Protected routes and permission-based navigation.
- Role-based interfaces for Admin, Manager, and Viewer.
- Resource listing, creation, editing, and deletion.
- Admin-only user listing.
- Centralized API error handling and session-expiry recovery.
- Responsive interface with the Obsidian Orange design system.

## Project Structure

```text
frontend/
├── public/             # Static assets
├── src/
│   ├── api/            # Axios client and error handling
│   ├── components/     # Shared layout and shadcn/ui components
│   ├── features/
│   │   ├── auth/       # Authentication state and services
│   │   ├── resources/  # Resource API service
│   │   └── users/      # Users API service
│   ├── lib/            # Shared utilities and Query Client
│   ├── pages/          # Application pages
│   ├── routes/         # Authentication and permission guards
│   ├── App.tsx         # Application routing
│   ├── index.css       # Global theme and styles
│   └── main.tsx        # Application entry point
├── package.json
└── vite.config.ts
```

Individual folders contain additional README files describing their responsibilities.

## Application Architecture

The frontend follows a feature-based structure with separate responsibilities:

1. **Pages** render interfaces and handle user interactions.
2. **Feature services** define typed API operations.
3. **Axios** manages HTTP communication and authentication recovery.
4. **TanStack Query** manages server data, loading states, and caching.
5. **AuthProvider** manages authentication state and session lifecycle.
6. **Route guards** control access to protected pages.

The Express backend performs the actual authentication and authorization checks.

## Routing & Permissions

| Route | Access |
|---|---|
| `/login` | Unauthenticated users |
| `/dashboard` | Authenticated users |
| `/resources` | Users with `resource:read` |
| `/users` | Users with `user:manage` |
| `/forbidden` | Authenticated users |

Admin can perform all resource actions and view users. Manager can read, create, and update resources. Viewer has read-only resource access.

## Authentication & Session Management

1. Users sign in through the login form.
2. The backend returns an access token and authenticated user information.
3. The access token is stored in JavaScript memory.
4. A backend-managed HttpOnly refresh cookie supports session restoration.
5. Axios handles eligible `401` responses by refreshing authentication.
6. Logout clears local authentication state and requests backend session revocation.

## Security Considerations

- Access tokens are not persisted in browser storage.
- Refresh credentials are handled by backend-set HttpOnly cookies.
- Authentication changes clear user-specific cached queries.
- Protected routes and conditional controls improve frontend usability.
- Backend middleware independently enforces authentication and RBAC.
- Demo credentials embedded in the frontend are intended only for disposable test accounts.
