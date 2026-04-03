# TaskFlow — Frontend

Next.js 14 (App Router) + TypeScript web application for the TaskFlow task manager. Features JWT auth with auto-refresh, animated task management UI, analytics charts, and full light/dark mode support.

---

## Stack

| Library | Purpose |
|---------|---------|
| Next.js 16 (App Router) | React framework, file-based routing |
| TypeScript | Type safety throughout |
| Tailwind CSS v4 | Utility-first styling (CSS-first config) |
| Framer Motion | Page and component animations |
| Zustand | Global state (auth + tasks), persisted to localStorage |
| Axios | HTTP client with request/response interceptors |
| react-hook-form | Form state management |
| Zod | Client-side form validation schemas |
| react-hot-toast | Toast notifications |
| next-themes | Light / dark / system theme switching |
| Recharts | Analytics line chart and pie charts |
| date-fns | Date formatting and comparison utilities |
| lucide-react | Icon set |

---

## Project Structure

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout — ThemeProvider, Toaster, global CSS
│   ├── page.tsx                # / → redirects to /dashboard
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login page (public only)
│   │   └── register/page.tsx   # Register page (public only)
│   └── dashboard/
│       └── page.tsx            # Main dashboard (protected)
├── components/
│   ├── analytics/
│   │   └── AnalyticsCharts.tsx # Line chart + 2 pie charts (toggled)
│   ├── layout/
│   │   └── Header.tsx          # Sticky header — logo, user pill, theme toggle, logout
│   ├── tasks/
│   │   ├── TaskCard.tsx        # Individual task row with toggle, edit, delete confirm
│   │   ├── TaskFilters.tsx     # Search bar + collapsible filter panel
│   │   ├── TaskForm.tsx        # Create / edit form (shared modal content)
│   │   ├── TaskList.tsx        # Animated list, sorts completed to bottom
│   │   ├── TaskSkeleton.tsx    # Shimmer placeholder during loading
│   │   └── EmptyState.tsx      # No tasks / no filter results illustration
│   └── ui/
│       ├── Badge.tsx           # StatusBadge, PriorityBadge (inline styles for reliability)
│       ├── Modal.tsx           # Spring-animated modal with backdrop, ESC to close
│       └── ThemeToggle.tsx     # Cycles light → dark → system with icon animation
├── hooks/
│   └── useDebounce.ts          # Generic debounce hook (350ms default)
├── lib/
│   ├── api.ts                  # Axios instance + auth interceptors + auto-refresh
│   └── utils.ts                # cn(), formatDueDate(), getInitials()
├── store/
│   ├── authStore.ts            # Zustand auth store (persisted)
│   └── taskStore.ts            # Zustand task store (filters, pagination, CRUD)
├── styles/
│   └── globals.css             # Design tokens (CSS vars), .card, .input-base, .skeleton
└── types/
    └── index.ts                # Shared TypeScript interfaces (Task, User, TaskFilters, etc.)
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Setup

```bash
npm install
# .env.local is already configured for local development
npm run dev   # starts on http://localhost:3000
```

---

## Application Flow

### 1. Bootstrap

When the app loads, Next.js renders the root layout which wraps everything in `ThemeProvider` (next-themes) and mounts the `Toaster`. The root `page.tsx` immediately redirects to `/dashboard`.

### 2. Auth Guard

`/dashboard/page.tsx` reads `isAuthenticated` from the Zustand auth store (persisted in `localStorage` via `zustand/middleware/persist`). If false, it redirects to `/login` before rendering anything.

### 3. Login / Register

```
User fills form
  → react-hook-form + Zod validates client-side
  → authStore.login() / authStore.register() called
  → POST /auth/login or POST /auth/register
  → On success: accessToken + refreshToken stored in localStorage
  → Zustand store updated: { user, isAuthenticated: true }
  → router.replace('/dashboard')
  → Toast: "Welcome back, {name}! 👋"
```

### 4. Authenticated Requests

Every Axios request goes through the request interceptor in `src/lib/api.ts`:

```
Request interceptor:
  reads localStorage.getItem('accessToken')
  sets Authorization: Bearer <token> header

Response interceptor (on 401):
  if not already retrying:
    POST /auth/refresh with refreshToken from localStorage
    on success: store new tokens, retry original request
    on failure: clear tokens, redirect to /login
```

This means token expiry is completely transparent to the user — the refresh happens silently in the background.

### 5. Dashboard Load

```
DashboardPage mounts
  → fetchTasks() called (taskStore)
  → GET /tasks?page=1&limit=10&sortBy=createdAt&sortOrder=desc
  → tasks + meta stored in Zustand
  → TaskSkeletonList shown during loading
  → TaskList renders with staggered fade-up animations
  → Completed tasks sorted to bottom (client-side stable sort)
```

### 6. Task CRUD

**Create**
```
"Add task" button → Modal opens → TaskForm renders
  → User fills title, description, status, priority, due date
  → Zod validates on submit
  → taskStore.createTask(payload)
  → POST /tasks
  → fetchTasks() re-fetches to sync pagination counts
  → Modal closes, toast: "Task created ✅"
```

**Edit**
```
Edit icon on TaskCard (visible on hover) → Modal opens with task pre-filled
  → TaskForm renders with defaultValues from task
  → On submit: taskStore.updateTask(id, payload)
  → PATCH /tasks/:id
  → Task updated in-place in Zustand array
  → Toast: "Task updated ✏️"
```

**Delete**
```
Trash icon on TaskCard → confirmDelete state = true
  → Inline confirmation overlay animates in on the card
  → "Cancel" dismisses overlay
  → "Delete" → taskStore.deleteTask(id)
  → DELETE /tasks/:id
  → Task removed from Zustand array
  → Card exits with slide-left + fade animation
  → Toast: "Task deleted 🗑️"
```

**Toggle status**
```
Circle/Clock/CheckCircle icon on TaskCard
  → taskStore.toggleTask(id)
  → PATCH /tasks/:id/toggle
  → Backend cycles: PENDING → IN_PROGRESS → COMPLETED → PENDING
  → Task updated in Zustand array
  → If now COMPLETED: card animates to bottom of list
  → Toast: "Status updated!"
```

### 7. Filtering & Search

```
TaskFilters component:
  Search input → useDebounce(350ms) → setFilters({ search }) → fetchTasks()
  Status dropdown → setFilters({ status }) → fetchTasks()
  Priority dropdown → setFilters({ priority }) → fetchTasks()
  Sort dropdown → setFilters({ sortBy, sortOrder }) → fetchTasks()
  Month picker → setFilters({ month, dateFrom: '', dateTo: '' }) → fetchTasks()
  Date from/to → setFilters({ dateFrom/dateTo, month: '' }) → fetchTasks()
  "Clear all" → resetFilters() → fetchTasks()

Every setFilters() call resets page to 1 (unless explicitly setting page).
```

### 8. Analytics

```
"Analytics" button in toolbar (next to "Add task")
  → toggles showAnalytics state
  → AnimatePresence animates height 0 → auto
  → AnalyticsCharts renders with current tasks prop

Charts:
  Line chart — tasks Created vs Completed vs Overdue per day (last 7 days)
  Pie chart 1 — task count by status (Pending / In Progress / Completed)
  Pie chart 2 — task count by priority (High / Medium / Low)
```

### 9. Theme

```
ThemeToggle in Header cycles: light → dark → system
  → next-themes sets class="dark" on <html>
  → CSS variables in :root / .dark switch all colors
  → 200ms transition on background-color, border-color, color
```

### 10. Logout

```
"Sign out" in Header
  → authStore.logout()
  → POST /auth/logout (clears refreshToken in DB)
  → localStorage tokens removed
  → Zustand: { user: null, isAuthenticated: false }
  → router.push('/login')
  → Toast: "See you later! 👋"
```

---

## State Management

### authStore (persisted)

```ts
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login(email, password) → Promise<boolean>
  register(name, email, password) → Promise<boolean>
  logout() → Promise<void>
}
```

Persisted keys: `user`, `isAuthenticated` — so the user stays logged in across page reloads without an extra API call.

### taskStore (in-memory)

```ts
{
  tasks: Task[]
  meta: PaginationMeta | null
  filters: TaskFilters
  isLoading: boolean
  isSubmitting: boolean
  fetchTasks() → Promise<void>
  createTask(data) → Promise<boolean>
  updateTask(id, data) → Promise<boolean>
  deleteTask(id) → Promise<boolean>
  toggleTask(id) → Promise<boolean>
  setFilters(partial) → void   // triggers fetchTasks()
  resetFilters() → void        // triggers fetchTasks()
}
```

---

## Design System

All design tokens are CSS custom properties defined in `globals.css`:

```css
--bg-base        /* page background */
--bg-surface     /* card background */
--bg-overlay     /* input / secondary surface */
--text-primary   /* headings, body */
--text-secondary /* muted body */
--text-muted     /* placeholders, disabled */
--border         /* dividers, input borders */
--accent         /* primary blue — buttons, links */
--accent-hover   /* darker blue on hover */
--accent-soft    /* light blue background for focus rings */
--success / --success-soft
--warning / --warning-soft
--danger  / --danger-soft
--shadow-sm / --shadow-md / --shadow-lg
```

Light and dark values are defined in `:root` and `.dark` respectively. All color transitions are 200ms ease.

---

## Demo Credentials

```
Email:    demo@taskflow.dev
Password: Password1!
```
