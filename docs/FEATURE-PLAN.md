# SHINEE — New Features + Testing Foundation Plan

> Reusable across sessions. Detailed, self-contained. Follow the four-layer backend pattern
> (`route → controller → service → model`, Zod schema via `validate` middleware) and the
> client `services/*Service.ts` + `types/*.ts` conventions already in the repo.

## Context

The full 7-item roadmap in `CLAUDE.md` has already shipped (stats dashboard, tags, calendar,
recurring tasks, command palette, notification bell, PWA — verified in code). This plan adds a
new wave of **brand-new features** plus the project's **first testing foundation**. Selected by
the user:

- Testing foundation (client + server)
- Subtasks / checklists
- Pomodoro / focus timer
- Data export / import
- Dark mode

Each workstream = its own branch off `main`, with regular commits as work progresses, and a PR
back to `main` when complete and verified. Do **not** commit to `main` directly.

### Key repo facts to respect
- `client/` and `server/` are **separate pnpm projects** (not a workspace). Install/run each.
- Backend layering: `routes/*.route.ts` → `controllers/*.controller.ts` (thin) →
  `services/*.service.ts` (all Mongoose) → `models/*.ts`. Bodies validated by Zod
  `schemas/*.schema.ts` via `server/src/middleware/validate.middleware.ts`. Routes protected by
  `protect` (`router.use(protect)` at top of each route file).
- Single-user scoped: every `Board`/`Task`/`Habit` has a `user` field; every service query
  filters by `req.user`. New data must do the same.
- Client: React 19 + Vite 7 + Tailwind **v4** (`@import 'tailwindcss'` in `index.css`),
  `react-router-dom` v7 (routing in `App.tsx`), axios via `client/src/lib/apiClient.ts`
  (JWT from `localStorage`, 401 → redirect). `zustand` is installed and available for state.
- **Design system is hardcoded**: brutalist palette `#0A0A0A` / `#F5C842` / `bg-white` appears
  as inline hex/utility classes across all JSX (see `App.tsx`). No theme tokens exist yet — this
  is the central obstacle for dark mode (Workstream E).
- Installed-but-unused: `@tanstack/react-query`, `@tanstack/react-router`, `better-auth`. Do not
  assume they're wired. `recharts` IS used (stats). No test runner anywhere.

### Recommended execution order
`A (testing) → B (subtasks) → C (pomodoro) → D (export/import) → E (dark mode)`.
Testing first so later features land with coverage. Dark mode last (largest refactor, best done
once other UI churn settles).

---

## Workstream A — Testing Foundation
**Branch:** `feature/testing-foundation`

**Why:** Zero tests exist in either project. Establish runners + a first meaningful slice so
subsequent features ship with coverage.

### Server (`server/`)
1. Add dev deps: `vitest`, `supertest`, `mongodb-memory-server`, `@types/supertest`.
2. `server/vitest.config.ts` — node environment, `globals: true`.
3. `server/src/test/setup.ts` — spin up `mongodb-memory-server`, connect Mongoose before all,
   drop + disconnect after all, clear collections between tests. Set a dummy `JWT_SECRET`.
4. Add script to `server/package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.
5. First tests (unit-level, highest value — pure domain logic):
   - `habit.service.test.ts` — `updateStreaksAndMultiplier` / `revertStreaksAndPoints`
     (streak/multiplier/points math). Highest-value: complex, no HTTP needed.
   - `task.service.test.ts` — `computeNextDueDate` + recurrence materialization on completion
     (`server/src/services/task.service.ts:7-11,72-91`).
   - `stats.service.test.ts` — aggregation shape.
6. One integration test with `supertest` against the Express `app`: refactor `server/src/server.ts`
   to **export `app`** (move `app.listen` behind an `if (require.main === module)` / separate
   `index.ts`) so tests can import it without binding the port. Then test auth flow:
   register → login → create board → create task (asserts `protect` + validation).

### Client (`client/`)
1. Add dev deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
   `@testing-library/user-event`, `jsdom`.
2. `client/vitest.config.ts` — `environment: 'jsdom'`, `globals: true`, setup file registering
   jest-dom matchers. (Vite config already exists — extend, don't clobber PWA config.)
3. Scripts in `client/package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.
4. First tests:
   - Pure util/service test: mock `apiClient` and assert `taskService` maps `data.data`.
   - Component test: render `TagChip` / `TagFilterBar` (small, prop-driven) and assert behavior.

### Commits
`chore(server): add vitest + in-memory mongo harness` · `test(server): habit & task service math`
· `refactor(server): export app for supertest` · `test(server): auth+task integration flow`
· `chore(client): add vitest + testing-library` · `test(client): taskService + TagChip`

### Verify
`cd server && pnpm test` and `cd client && pnpm test` both green. CI-friendly (no external Mongo).

---

## Workstream B — Subtasks / Checklists
**Branch:** `feature/subtasks-checklists`

**Why:** Break a task into ordered checklist items with completion + a progress bar. Embedded
subdocs (like existing `tags`) — no new collection, no extra endpoints needed.

### Backend
- **Model** `server/src/models/Task.ts`: add `ISubtask { title: string; completed: boolean }`
  and a `subtaskSchema` (`{ _id: true }` so items are addressable), then
  `subtasks: { type: [subtaskSchema], default: [] }` on `taskSchema`. Mirror the existing
  `tagSchema` pattern (lines 29-32, 56).
- **Schema** `server/src/schemas/task.schema.ts`: add
  `SubtaskSchema = z.object({ _id: z.string().optional(), title: z.string().min(1).max(120), completed: z.boolean().default(false) })`
  and `subtasks: z.array(SubtaskSchema).default([])` on `TaskSchema`. Because `UpdateTaskPayloadSchema`
  is `CreateTaskSchema.partial()`, PATCH already accepts `subtasks` once added — **no new route
  or controller needed**; updates go through the existing `PATCH /api/tasks/:id`.
- No service change required unless you want a dedicated toggle endpoint (optional; the array
  replace via PATCH is sufficient for v1).

### Frontend
- **Types** `client/src/types/task.ts` — regenerate/extend from Zod (types are inferred there).
- **Component** `client/src/components/SubtaskList.tsx` — checklist inside `TaskModal.tsx`:
  add item (Enter), toggle checkbox, delete item, reorder optional (v2). Progress bar
  `done/total`. Brutalist style: thick border, `#F5C842` fill on the progress bar.
- Wire into `client/src/components/TaskModal.tsx` (where `tags` are edited today). Save sends the
  full `subtasks` array via `taskService.updateTask`.
- **Card badge**: on the Kanban card in `client/src/pages/BoardDetailsPage.tsx`, show a small
  `☑ 2/5` indicator when `subtasks.length > 0`.

### Commits
`feat(task): subtasks model + schema` · `feat(client): SubtaskList in TaskModal` ·
`feat(board): subtask progress badge on cards` · `test: subtask schema + SubtaskList`

### Verify
Create a task, add 3 subtasks, tick one → progress bar 1/3, badge `☑ 1/3` on card. Reload →
persisted. Add a server schema test asserting `subtasks` round-trips through PATCH.

---

## Workstream C — Pomodoro / Focus Timer
**Branch:** `feature/pomodoro-timer`

**Why:** A dedicated focus timer (work/break cycles) that feeds the existing per-task time
tracking (`totalTimeSpent`) and optionally habit XP. Leverages existing infra: tasks already
have `totalTimeSpent`, `activeStartTime`, `targetDuration`.

### Approach (client-first, minimal backend)
The timer is a **client concern**; persistence reuses the existing task time fields. Keep backend
changes near-zero.

### Frontend
- **State** `client/src/store/pomodoroStore.ts` (zustand — already installed): current phase
  (`focus`/`shortBreak`/`longBreak`), remaining seconds, running flag, cycle count, optional
  linked `taskId`, settings (focus 25m / short 5m / long 15m / long-break-every 4). Persist
  settings + running session to `localStorage` (zustand `persist`) so a refresh resumes. Use a
  single `setInterval` driven by wall-clock delta (compute from a stored `startedAt` timestamp)
  so background-tab throttling doesn't drift.
- **Component** `client/src/components/PomodoroWidget.tsx` — floating widget (bottom-right),
  start/pause/reset, phase label, big countdown, optional task selector. Brutalist card.
- **Mount** globally in `App.tsx` next to `<CommandPalette />` (only when authenticated —
  gate on `useAuth`).
- **Task integration**: when a focus phase completes (or on pause) while a `taskId` is linked,
  add elapsed focus ms to that task's `totalTimeSpent` via `taskService.updateTask`. Reuse the
  existing timer semantics rather than inventing a new field.
- **Completion cue**: title-bar flash + optional in-app toast (see Workstream D toast note if
  a toast system is added; otherwise a simple inline banner). Do **not** use `alert()`.

### Backend
- None required for v1. (Optional v2: a `focusSessions` collection for stats — defer.)

### Commits
`feat(client): pomodoro zustand store w/ persist` · `feat(client): PomodoroWidget UI` ·
`feat(client): link pomodoro focus time to task totalTimeSpent` · `test: pomodoro store reducer`

### Verify
Start a 25m focus (temporarily set to ~5s for testing), link a task, let it complete → task
`totalTimeSpent` increases; refresh mid-session → countdown resumes from correct wall-clock time.

---

## Workstream D — Data Export / Import
**Branch:** `feature/data-export-import`

**Why:** Let the single user back up / migrate all their data (boards, tasks, habits, weekly
logs) as JSON, and re-import it.

### Backend (new module, follows the four-layer pattern)
- `server/src/routes/data.route.ts` — `router.use(protect)`, then
  `GET /api/data/export` and `POST /api/data/import` (validated).
- `server/src/controllers/data.controller.ts` — thin.
- `server/src/services/data.service.ts`:
  - `exportAll(userId)` — gather `Board`, `Task`, `Habit`, `WeeklyLog` filtered by `user`, return
    `{ version: 1, exportedAt, boards, tasks, habits, weeklyLogs }`.
  - `importAll(userId, payload, mode)` — `mode: 'merge' | 'replace'`. **Remap IDs**: generate new
    `_id`s and rebuild `boardId` / `habitId` references so imported data belongs to the current
    user and never collides. `replace` deletes the user's existing docs first (inside a try; warn
    in UI — destructive). Always force `user = userId` on every inserted doc (never trust the
    file's `user`).
- `server/src/schemas/data.schema.ts` — Zod `ImportSchema` validating the export shape + `mode`.
- Mount in `server/src/server.ts`: `app.use("/api/data", dataRoutes)` alongside the others.

### Frontend
- `client/src/services/dataService.ts` — `exportData()` (GET, triggers a JSON file download via
  Blob + anchor), `importData(file, mode)` (read file → POST).
- Add an **Export / Import** section to `client/src/pages/ProfilePage.tsx`: "Download backup"
  button + file picker with a merge/replace toggle and a confirm modal (reuse
  `client/src/components/DeleteConfirmModal.tsx`) for `replace`.
- CSV (tasks-only) is a **nice-to-have v2** — JSON round-trip is the priority.

### Commits
`feat(server): data export/import module` · `feat(server): id remap + replace/merge modes` ·
`feat(client): dataService + Profile export/import UI` · `test(server): export/import round-trip`

### Verify
Export → inspect JSON has all four collections. Import into a fresh account (merge) → data
appears with new IDs, references intact, `user` correct. Add a server test: seed → export →
wipe → import → assert counts + relationships restored.

---

## Workstream E — Dark Mode (largest lift)
**Branch:** `feature/dark-mode`

**Why:** Theme toggle honoring the brutalist palette, persisted. **Central obstacle:** colors are
hardcoded as inline hex/utilities (`#0A0A0A`, `#F5C842`, `bg-white`, `text-white`) throughout the
JSX — they will NOT respond to a `dark` class on their own. This requires a token migration, so
scope it deliberately.

### Strategy — Tailwind v4 `class`-based dark mode + CSS variables
1. **Define tokens** in `client/src/index.css` (`:root` already holds `--primary`/`--secondary`/
   `--accent` at lines 32-34). Add a dark override block:
   ```css
   :root { --bg: #FFFFFF; --surface: #F5F5F5; --fg: #0A0A0A; --accent: #F5C842; --border: #0A0A0A; }
   :root.dark { --bg: #0A0A0A; --surface: #161616; --fg: #F5F5F5; --accent: #F5C842; --border: #F5C842; }
   ```
   Register a Tailwind v4 custom dark variant in the CSS: `@custom-variant dark (&:where(.dark, .dark *));`
   and expose the tokens via `@theme` so `bg-bg`, `text-fg`, `border-border`, `bg-accent` utilities exist.
2. **Theme state** `client/src/store/themeStore.ts` (zustand + persist) or a small
   `ThemeContext`. Toggles `document.documentElement.classList.toggle('dark')`, persists to
   `localStorage`, respects `prefers-color-scheme` on first load. Update `color-scheme` in CSS.
3. **Toggle UI**: a sun/moon button in `client/src/components/Navbar.tsx` (lucide icons already
   available).
4. **Migration (the bulk of the work)**: replace hardcoded palette utilities with token
   utilities across all pages/components. Systematic find-and-replace guided by:
   - `bg-white` → `bg-bg`, `text-[#0A0A0A]` → `text-fg`, `border-[#0A0A0A]` → `border-border`,
     `bg-[#0A0A0A]` → `bg-fg`(inverse contexts) — audit each; some are intentional (e.g. accent
     buttons stay `#F5C842`). **Do it page-by-page**, committing per page, to keep diffs reviewable.
   - Start with high-traffic surfaces: `App.tsx`, `Navbar.tsx`, `DashboardPage.tsx`,
     `BoardDetailsPage.tsx`, then modals, then the rest.
   - Grep helper: `grep -rn "#0A0A0A\|bg-white\|text-white\|#F5C842" client/src` to enumerate.
5. **Charts**: `recharts` components in `client/src/components/stats/` use explicit colors — pass
   theme-aware colors (read the CSS var or branch on the theme value).

### Commits (many small, per surface)
`feat(client): dark-mode tokens + custom variant` · `feat(client): theme store + Navbar toggle` ·
`refactor(client): migrate <page> to theme tokens` (repeat per page) · `fix(client): dark-aware recharts colors`

### Verify
Toggle → whole app flips light/dark, persists across reload, respects OS preference on first
visit. Walk every route (`/`, `/dashboard`, `/board/:id`, `/habits`, `/calendar`, `/stats`,
`/profile`, login/register) in both themes checking contrast — no unreadable hardcoded remnants.
Run `pnpm build` and `pnpm lint` clean.

---

## Cross-cutting rules
- Branch per workstream off `main`; commit regularly (messages above are the intended cadence);
  open a PR to `main` when each workstream is verified. Never merge directly.
- Every new backend query filters by `req.user`; every insert forces `user = req.user`.
- New Zod schema for every new request body; wire through `validate` middleware.
- Keep controllers thin; all Mongoose in services.
- After each workstream, run the relevant `pnpm test` / `pnpm build` / `pnpm lint`.

## Optional appendix — infra hardening (NOT selected, noted for later)
Found during audit, deferred unless requested:
- `helmet` + `compression` are installed but **not wired** in `server/src/server.ts`.
- No global Express error-handler middleware (services throw; no central catch).
- No rate limiting on auth routes.
- JWT stored in `localStorage` (XSS-exposed) — consider httpOnly cookie + refresh flow.
- `@tanstack/react-query` installed but unused — could replace manual fetches for caching.
- No client toast system — API errors are silent except the 401 redirect
  (`client/src/lib/apiClient.ts:42`). A toast lib would improve C/D UX.

## Verification summary (end-to-end)
1. `cd server && pnpm test` — green (Workstream A harness + per-feature tests).
2. `cd client && pnpm test` — green.
3. `cd server && pnpm build` and `cd client && pnpm build && pnpm lint` — clean.
4. Manual smoke via `pnpm dev` (both): subtasks persist + badge; pomodoro accrues task time and
   resumes after refresh; export→import round-trips with intact references; dark-mode toggle
   flips all routes and persists.
