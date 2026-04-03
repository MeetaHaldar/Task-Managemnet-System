# TaskFlow

A full-stack task manager with JWT auth, priority management, and rich filtering — built with Next.js 14 + Express + PostgreSQL.

## Tech Stack

| Layer | Library | Purpose |
|-------|---------|---------|
| Frontend | Next.js 14 (App Router) | React framework |
| Frontend | TypeScript | Type safety |
| Frontend | Tailwind CSS v4 | Styling |
| Frontend | Framer Motion | Animations |
| Frontend | Zustand | State management |
| Frontend | Axios | HTTP client + auto-refresh |
| Frontend | react-hook-form + Zod | Form validation |
| Frontend | react-hot-toast | Toast notifications |
| Frontend | next-themes | Light/dark mode |
| Backend | Express + TypeScript | REST API |
| Backend | Prisma ORM | Database access |
| Backend | PostgreSQL | Database |
| Backend | JWT (access + refresh) | Authentication |
| Backend | bcryptjs | Password hashing |
| Backend | Zod | Request validation |

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- npm

## Setup

```bash
# 1. Clone and install
git clone <repo>

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT secrets

# Run migrations and seed
npx prisma migrate dev --name init
npx prisma db seed

# Start backend (port 5000)
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
# .env.local already set to http://localhost:5000

# Start frontend (port 3000)
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, get tokens |
| POST | /auth/refresh | No | Rotate refresh token |
| POST | /auth/logout | Yes | Invalidate refresh token |
| GET | /tasks | Yes | List tasks (paginated, filterable) |
| POST | /tasks | Yes | Create task |
| GET | /tasks/:id | Yes | Get single task |
| PATCH | /tasks/:id | Yes | Update task |
| DELETE | /tasks/:id | Yes | Delete task |
| PATCH | /tasks/:id/toggle | Yes | Cycle status |

### GET /tasks Query Params

`page`, `limit`, `status`, `priority`, `search`, `sortBy`, `sortOrder`, `dateFrom`, `dateTo`, `month` (YYYY-MM)

## Demo Credentials

```
Email:    demo@taskflow.dev
Password: Password1!
```

## License

MIT
