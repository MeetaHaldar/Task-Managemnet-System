# TaskFlow — Backend API

Node.js + TypeScript REST API powering the TaskFlow task manager. Built with Express, Prisma ORM, PostgreSQL, JWT authentication, and Zod validation.

---

## Stack

| Library | Purpose |
|---------|---------|
| Express | HTTP server and routing |
| TypeScript | Type safety throughout |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database (hosted on Supabase) |
| @prisma/adapter-pg | Prisma driver adapter for PgBouncer-compatible connections |
| bcryptjs | Password hashing (12 salt rounds) |
| jsonwebtoken | Access token (15m) + refresh token (7d) signing and verification |
| Zod | Request body/param validation schemas |
| helmet | HTTP security headers |
| cors | Cross-origin resource sharing |
| morgan | HTTP request logging |
| dotenv | Environment variable loading |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Data models: User, Task, enums
│   ├── seed.ts              # Demo user + sample tasks
│   └── migrations/          # SQL migration history
├── src/
│   ├── app.ts               # Express app entry point, middleware, route mounting
│   ├── lib/
│   │   └── prisma.ts        # Singleton PrismaClient with pg adapter
│   ├── controllers/
│   │   ├── auth.controller.ts   # HTTP handlers for auth routes
│   │   └── task.controller.ts   # HTTP handlers for task routes
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic (register, login, refresh, logout)
│   │   └── task.service.ts      # Task CRUD + toggle + filtering logic
│   ├── routes/
│   │   ├── auth.routes.ts       # POST /auth/*
│   │   └── task.routes.ts       # GET|POST|PATCH|DELETE /tasks/*
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT Bearer token verification
│   │   ├── validate.middleware.ts # Zod schema validation wrapper
│   │   └── error.middleware.ts  # 404 handler + global error handler
│   ├── schemas/
│   │   ├── auth.schema.ts       # Zod schemas for register/login/refresh
│   │   └── task.schema.ts       # Zod schemas for create/update/id param
│   ├── types/
│   │   └── index.ts             # Shared TypeScript interfaces
│   └── utils/
│       ├── jwt.utils.ts         # signAccessToken, signRefreshToken, verify*
│       ├── hash.utils.ts        # hashPassword, verifyPassword
│       └── response.utils.ts    # sendSuccess, sendError helpers
├── .env                     # Local environment variables (not committed)
├── .env.example             # Template for required env vars
├── prisma.config.ts         # Prisma CLI config (uses DIRECT_URL for migrations)
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development

# Pooled connection (PgBouncer) — used at runtime
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"

# Direct connection — used by Prisma CLI for migrations
DIRECT_URL="postgresql://user:pass@host:5432/db"

ACCESS_TOKEN_SECRET=<min 32 chars>
REFRESH_TOKEN_SECRET=<min 32 chars, different from above>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
```

---

## Setup

```bash
npm install

# Copy env template and fill in values
cp .env.example .env

# Run database migration
npx prisma migrate dev --name init

# Seed demo data
npx ts-node --transpile-only prisma/seed.ts

# Start dev server (port 5000, hot reload)
npm run dev
```

---

## Request / Response Format

### Success

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 23, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false }
}
```

`meta` is only present on paginated list responses.

### Error

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": { "fieldName": ["validation message"] }
}
```

`errors` is only present on 400 validation failures.

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation failure |
| 401 | Unauthenticated / invalid token |
| 404 | Not found (also used for unauthorized resource access to prevent enumeration) |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Unexpected server error |

---

## API Routes

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |

**Response 200**
```json
{ "status": "healthy", "timestamp": "2026-04-03T12:00:00.000Z", "environment": "development" }
```

---

### Auth — `POST /auth/*`

#### POST /auth/register

Creates a new user account and returns tokens.

**Request body**
```json
{ "name": "Alex Chen", "email": "alex@example.com", "password": "Password1!" }
```

**Validation rules**
- `name` — 2–50 characters, required
- `email` — valid format, unique in DB, required
- `password` — min 8 chars, must include uppercase, lowercase, and a number

**Response 201**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "uuid", "name": "Alex Chen", "email": "alex@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Response 409** — email already in use
```json
{ "success": false, "message": "Email already in use" }
```

**Response 400** — validation failure
```json
{ "success": false, "message": "Validation failed", "errors": { "password": ["Password must contain at least one uppercase letter"] } }
```

---

#### POST /auth/login

Authenticates a user and returns tokens.

**Request body**
```json
{ "email": "alex@example.com", "password": "Password1!" }
```

**Response 200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "name": "Alex Chen", "email": "alex@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Response 401** — wrong credentials
```json
{ "success": false, "message": "Invalid email or password" }
```

---

#### POST /auth/refresh

Rotates the refresh token and returns a new token pair.

**Request body**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." }
}
```

**Response 401** — token invalid, expired, or already rotated
```json
{ "success": false, "message": "Refresh token is invalid or expired" }
```

---

#### POST /auth/logout

Invalidates the stored refresh token. Requires `Authorization: Bearer <accessToken>`.

**Response 200**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### Tasks — `/tasks/*`

All task routes require `Authorization: Bearer <accessToken>`. Every query is automatically scoped to the authenticated user — accessing another user's task returns 404.

---

#### GET /tasks

Returns a paginated, filterable list of the current user's tasks.

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |
| `status` | string | — | Filter: `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |
| `priority` | string | — | Filter: `LOW` \| `MEDIUM` \| `HIGH` |
| `search` | string | — | Case-insensitive title search |
| `sortBy` | string | `createdAt` | `createdAt` \| `updatedAt` \| `title` \| `dueDate` \| `priority` |
| `sortOrder` | string | `desc` | `asc` \| `desc` |
| `dateFrom` | ISO date | — | Filter tasks with `dueDate >= dateFrom` |
| `dateTo` | ISO date | — | Filter tasks with `dueDate <= dateTo` |
| `month` | `YYYY-MM` | — | Filter tasks with `dueDate` within that calendar month |

**Response 200**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Design landing page",
      "description": "Create wireframes for Q4 redesign",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2026-04-06T12:00:00.000Z",
      "createdAt": "2026-04-03T10:00:00.000Z",
      "updatedAt": "2026-04-03T10:00:00.000Z",
      "userId": "uuid"
    }
  ],
  "meta": {
    "page": 1, "limit": 10, "total": 5,
    "totalPages": 1, "hasNextPage": false, "hasPrevPage": false
  }
}
```

---

#### POST /tasks

Creates a new task.

**Request body**
```json
{
  "title": "Write API docs",
  "description": "Document all endpoints",
  "status": "PENDING",
  "priority": "MEDIUM",
  "dueDate": "2026-04-10T00:00:00.000Z"
}
```

`title` is required. All other fields are optional. `userId` is set from the JWT — never from the request body.

**Response 201**
```json
{ "success": true, "message": "Task created successfully", "data": { ...task } }
```

---

#### GET /tasks/:id

Returns a single task by ID.

**Response 200**
```json
{ "success": true, "message": "Task retrieved", "data": { ...task } }
```

**Response 404** — not found or belongs to another user
```json
{ "success": false, "message": "Task not found" }
```

---

#### PATCH /tasks/:id

Updates one or more fields of a task. Only provided fields are updated (partial update).

**Request body** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "New description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2026-04-15T00:00:00.000Z"
}
```

Extra/unknown fields are rejected with 400 (`.strict()` schema).

**Response 200**
```json
{ "success": true, "message": "Task updated successfully", "data": { ...task } }
```

---

#### DELETE /tasks/:id

Permanently deletes a task.

**Response 200**
```json
{ "success": true, "message": "Task deleted successfully", "data": null }
```

---

#### PATCH /tasks/:id/toggle

Cycles the task status forward: `PENDING → IN_PROGRESS → COMPLETED → PENDING`.

**Response 200**
```json
{ "success": true, "message": "Task status toggled", "data": { ...task, "status": "IN_PROGRESS" } }
```

---

## Request Flow

```
Client Request
     │
     ▼
helmet()          — sets security headers
cors()            — validates origin against CLIENT_URL
morgan()          — logs method, path, status, response time
express.json()    — parses JSON body (limit: 10kb)
     │
     ▼
Router match
     │
     ├─ /auth/*  ──► validate(zodSchema) ──► controller ──► AuthService ──► Prisma ──► DB
     │
     └─ /tasks/* ──► requireAuth ──► validate(zodSchema) ──► controller ──► TaskService ──► Prisma ──► DB
                          │
                    verifyAccessToken()
                    attaches req.user = { userId, email }
     │
     ▼
sendSuccess() / sendError()   — uniform JSON response shape
     │
     ▼
globalErrorHandler()          — catches any unhandled errors, returns 500
```

### Auth Flow Detail

```
Register:
  1. Validate body (Zod)
  2. Check email uniqueness
  3. bcrypt.hash(password, 12)
  4. prisma.user.create()
  5. Sign accessToken (15m) + refreshToken (7d)
  6. Store refreshToken in DB
  7. Return user + tokens

Login:
  1. Validate body (Zod)
  2. prisma.user.findUnique({ email })
  3. bcrypt.compare(password, hash)
  4. Sign new token pair
  5. Update refreshToken in DB
  6. Return user + tokens

Refresh:
  1. Verify refreshToken signature + expiry
  2. Match against stored token in DB (rotation check)
  3. Sign new token pair
  4. Overwrite stored refreshToken (old one is now invalid)
  5. Return new token pair

Logout:
  1. requireAuth middleware validates accessToken
  2. Set user.refreshToken = null in DB
  3. Access token expires naturally (15m)
```

### Task Ownership

Every task query includes `where: { id, userId }`. If a task exists but belongs to a different user, Prisma returns `null` — the service throws `TASK_NOT_FOUND` and the controller responds with 404. This prevents user enumeration (no 403 that would confirm the resource exists).

---

## Data Models

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  password     String           // bcrypt hash
  refreshToken String?          // null when logged out
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tasks        Task[]
}

model Task {
  id          String     @id @default(uuid())
  title       String     @db.VarChar(200)
  description String?    @db.VarChar(1000)
  status      TaskStatus @default(PENDING)   // PENDING | IN_PROGRESS | COMPLETED
  priority    Priority   @default(MEDIUM)    // LOW | MEDIUM | HIGH
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String     // FK → User.id, cascade delete
}
```

---

## Demo Credentials

```
Email:    demo@taskflow.dev
Password: Password1!
```
