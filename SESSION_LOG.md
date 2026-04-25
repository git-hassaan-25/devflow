# DevFlow — Session Log (2026-04-24)

## Project vision

**DevFlow** — a MERN task-management platform. Mix of Trello + Notion + Jira. Core entities: **User → Project → Task**. Tasks have status (`todo` / `in-progress` / `done`) and will be rendered as a drag-and-drop Kanban board.

Project was chosen specifically to train real API design, scalable folder structure, and clean architecture (interview readiness), not just "make a CRUD app."

## Roadmap status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Basic API, connect React ↔ Node | Done |
| 2 | Users + auth | Done |
| 3 | Projects + tasks (CRUD) | Done |
| 4 | Advanced UI + optimization (Kanban, real-time) | Next |

## What was built

### Backend (Node + Express + MongoDB)

**Scaffold & infra:**
- `server/src/server.js` — entry; loads env first, awaits `connectDB()`, then starts listener
- `server/src/app.js` — Express app (cors, json parser, routes, error middleware)
- `server/src/config/db.js` — MongoDB Atlas connection
- `server/src/routes/index.js` — mounts all feature routers under `/api`
- `server/src/middleware/errorMiddleware.js` — `notFound` + centralized `errorHandler`
- `server/package.json` — ES modules (`"type": "module"`), scripts `start` / `dev`

**Auth feature (Phase 2):**
- `server/src/models/User.js` — name/email/password/avatar/role; bcrypt pre-save hook; `matchPassword` instance method; `password: select: false`
- `server/src/utils/generateToken.js` — JWT signer, 7-day expiry
- `server/src/controllers/authController.js` — `register`, `login`, `getMe`
- `server/src/middleware/authMiddleware.js` — `protect` (verifies JWT + hydrates `req.user`) and `requireRole(...roles)` factory
- `server/src/routes/authRoutes.js`

**Projects + Tasks feature (Phase 3):**
- `server/src/models/Project.js` — name/description/owner(ref User)/members(array ref User)
- `server/src/models/Task.js` — title/description/status(enum)/project(ref)/assignee/createdBy/dueDate
- `server/src/controllers/projectController.js` — create/list-mine/get/update/delete with owner-vs-member authorization
- `server/src/controllers/taskController.js` — same CRUD, with parent-project access check using local `userCanAccessProject` helper
- `server/src/routes/projectRoutes.js` — uses `router.use(protect)` + `router.route(...).post().get()` pattern
- `server/src/routes/taskRoutes.js`

### Frontend (Vite + React + React Router + Axios)
- Scaffold only — `client/src/pages/Home.jsx` pings `/api/health` to prove end-to-end connectivity
- `client/src/api/axios.js` — single shared axios instance, reads `VITE_API_URL`
- `client/vite.config.js` — dev proxy `/api → localhost:5000`
- Folder skeleton ready: `pages/`, `components/`, `features/`, `hooks/`, `context/`, `utils/`

## Complete API surface

| Method | Path | Auth | Authorization |
|--------|------|------|---------------|
| `GET` | `/api/health` | public | — |
| `POST` | `/api/auth/register` | public | — |
| `POST` | `/api/auth/login` | public | — |
| `GET` | `/api/auth/me` | Bearer | self |
| `POST` | `/api/projects` | Bearer | any user (becomes owner) |
| `GET` | `/api/projects` | Bearer | owner or member |
| `GET` | `/api/projects/:id` | Bearer | owner or member |
| `PUT` | `/api/projects/:id` | Bearer | **owner only** |
| `DELETE` | `/api/projects/:id` | Bearer | **owner only** |
| `POST` | `/api/tasks` | Bearer | owner or member of parent project |
| `GET` | `/api/tasks?project=<id>` | Bearer | owner or member of project |
| `GET` | `/api/tasks/:id` | Bearer | owner or member of parent project |
| `PUT` | `/api/tasks/:id` | Bearer | owner or member of parent project |
| `DELETE` | `/api/tasks/:id` | Bearer | owner or member of parent project |

## Key patterns & decisions (house rules)

These are the conventions committed to. Keep consistent as the codebase grows.

1. **Controller shape** — every async handler wraps its body in `try { ... } catch (err) { next(err); }`. Express 4 doesn't auto-catch async errors.
2. **Authorization ladder** — always 400 (invalid id) → 404 (not found) → 403 (not allowed), in that order. Never skip steps.
3. **`.equals()`, never `===`** — for comparing Mongo ObjectIds.
4. **Selective update** — destructure `req.body` for allowed fields only, then `if (field !== undefined)`. Never blind `findByIdAndUpdate(id, req.body)` (mass-assignment risk).
5. **Password hygiene** — `select: false` on the schema + explicit `.select('+password')` only inside `login`. Password never in response.
6. **Mongo `unique` + duplicate check** — `unique: true` on the schema PLUS explicit `findOne` in register for nicer error messages.
7. **`router.use(protect)`** once at top of a router, not on every route. Impossible to forget.
8. **Flat routes, not nested** — `GET /api/tasks?project=<id>` rather than `GET /api/projects/:id/tasks`. Keeps each resource router independent.
9. **Populate only what you need** — list endpoints populate `owner` lightly; detail endpoints populate more. Never over-fetch.
10. **Enum as a state machine** — `status` enum serves as validation, self-documentation, and index target for Kanban queries.
11. **Local DRY before shared DRY** — `userCanAccessProject` lives inside `taskController.js` because it's only used there. Extract to `utils/access.js` when a second file needs it, not sooner.

## Environment state

- MongoDB Atlas: connected
- Server: `http://localhost:5000` via `npm run dev`
- Client: `http://localhost:5173` via `npm run dev`
- Not a git repo (no `.git` initialized)
- `.env` exists on server with real Atlas + JWT secret

## Testing commands (Windows cmd)

Replace `TOKEN`, `PROJECT_ID`, `TASK_ID` as needed.

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Mudasser\",\"email\":\"m@x.com\",\"password\":\"secret123\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"m@x.com\",\"password\":\"secret123\"}"

# Whoami (protected)
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer TOKEN"

# Create project
curl -X POST http://localhost:5000/api/projects ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"DevFlow MVP\",\"description\":\"Kanban board\"}"

# List my projects
curl http://localhost:5000/api/projects -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:5000/api/tasks ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Set up DB\",\"project\":\"PROJECT_ID\"}"

# Get board for a project
curl "http://localhost:5000/api/tasks?project=PROJECT_ID" -H "Authorization: Bearer TOKEN"

# Simulate drag-drop: move task to done
curl -X PUT http://localhost:5000/api/tasks/TASK_ID ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"done\"}"
```

## Where we stopped — decision pending

Next direction to pick:

**Option A — Backend polish**
- Pagination on list endpoints (critical once data grows)
- Input validation layer (Joi or Zod)
- Invite/remove members endpoints on projects
- Seed script (demo user + project + tasks so you stop re-curling)

**Option B — Jump to Phase 4 frontend (recommended)**
- Auth pages (register, login) + token storage (localStorage or context)
- Projects dashboard
- Kanban board with drag-and-drop + status update via existing `PUT /api/tasks/:id`

**Recommendation:** Option B, with a ~20-line seed script as a quick detour first so the UI has believable data to render against.

## Resume prompt for next session

> continue DevFlow — I want option A / B

(Or just describe what you want to build next. Memory will carry project state, teaching cadence, and where we left off.)