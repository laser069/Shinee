# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SHINEE — a full-stack productivity app combining Kanban task boards (with per-task time tracking) and a gamified weekly habit tracker (streaks, XP, multipliers). Brutalist visual style: heavy black borders, `#0A0A0A`/`#F5C842` (black/yellow) palette, chunky rounded cards. Single-user scoped throughout (every Board/Task/Habit has a `user` field) — no collaboration/sharing model exists.

`client/` and `server/` are two independent pnpm projects (not a workspace/monorepo) — install and run each separately.

## Commands

```bash
# Server (Express + TS, port 5000)
cd server
pnpm install
pnpm dev          # tsx watch src/server.ts
pnpm build        # tsc -> dist/
pnpm start        # node dist/server.js

# Client (Vite + React, default port 5173, CORS-locked to http://localhost:3000)
cd client
pnpm install
pnpm dev
pnpm build         # tsc -b && vite build
pnpm lint          # eslint .
pnpm preview
```

No test suite exists in either project (no jest/vitest/mocha configured).

### Required server env (`server/.env`)
```env
MONGO_URI=mongodb://127.0.0.1:27017/shinee
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```
Validated via Zod in `server/src/config/env.ts` — the server will fail fast if these are missing.

Optional client env (`client/.env`): `VITE_API_URL` (defaults to `http://localhost:5000`).

## Architecture

### Backend layering (per resource: board, task, habit, user)
`routes/*.route.ts` → `controllers/*.controller.ts` (thin, req/res only) → `services/*.service.ts` (domain logic, all Mongoose queries) → `models/*.ts` (Mongoose schemas). Request bodies are validated with Zod schemas in `schemas/*.schema.ts` via the `validate` middleware (`server/src/middleware/validate.middleware.ts`). All board/task/habit routes are protected by JWT (`server/src/middleware/auth.middleware.ts`'s `protect`), applied with `router.use(protect)` at the top of each route file. New resource modules should follow this exact four-layer pattern.

### Data model relationships
- `Board` holds an array of `Task` refs; `Task.boardId` points back. Task status is one of `todo` / `inprogress` / `done`, mapped to Backlog/Active/Resolved columns in the UI.
- Task time tracking: `totalTimeSpent`, `activeStartTime`, `targetDuration` on `Task` — the timer starts when a task's status moves to `inprogress` and accumulates into `totalTimeSpent`. There is no dedicated "completed at" timestamp — `updatedAt` is the closest proxy for when a task was marked done.
- `Habit` is the template (name, color, `frequencyType`: `fixed`/`flexible`, `fixedDays`, `goalCount`, plus gamification fields: `dailyStreak`, `weeklyStreak`, `longestStreak`, `multiplier`, `totalPoints`). `WeeklyLog` stores one document per `(habitId, weekStartDate)` with per-day (0=Mon..6=Sun) completion — unique compound index enforces this. Streak/multiplier/point math lives in `habit.service.ts` (`updateStreaksAndMultiplier` / `revertStreaksAndPoints`), triggered from the toggle-day flow.
- `server/API.md` documents endpoints but its model/schema snippets are stale relative to the actual code in `src/models` and `src/schemas` — trust the source files over that doc.

### Frontend structure
- `App.tsx` owns all routing (plain `react-router-dom`, not the installed-but-unused `@tanstack/react-router`/`@tanstack/react-query`/`better-auth` — those are present in `client/package.json` but not wired up anywhere; don't assume they're in use). Protected routes wrap pages in `<ProtectedRoute>` (`client/src/components/ProtectedRoute.tsx`), gated by `AuthContext.tsx`.
- Each resource has a matching `services/*Service.ts` (axios calls through `client/src/lib/apiClient.ts`) and `types/*.ts`.
- Drag-and-drop Kanban columns use `@hello-pangea/dnd` (`client/src/pages/BoardDetailsPage.tsx`).
- Self-hosted variable fonts in `client/src/assets/` (Space Grotesk for body, Syne for the logo, Sora for bold/strong text, Bodoni Moda also present).

## Git workflow

- Create a new feature branch off the current working branch before starting a task (e.g. `feature/<name>`) — don't commit directly to `main`/`refine-ui`.
- Commit regularly as work progresses rather than one large commit at the end.
- Open a PR back to the base branch once a feature is complete and verified — don't merge directly.

## Roadmap

Captured from planning discussions, in priority order:

1. **Analytics/Stats Dashboard** — task + habit trend charts (`/stats` route, new `stats` backend module aggregating `Task`/`Habit`/`WeeklyLog` data).
2. **Tags/labels + filtering** — add `tags: string[]` to `Task`, filter UI on the board view. Foundational for search/calendar below.
3. **Calendar view** — visualize tasks by `dueDate` and habits by scheduled day, drag-to-reschedule.
4. **Recurring tasks** — recurrence rule on `Task` (daily/weekly/monthly), materialized on completion rather than via a cron job.
5. **Quick capture / global search** — command-palette modal (`Ctrl+K`) across boards/tasks/habits.
6. **Reminders/notifications** — needs a scheduler (e.g. `node-cron`) and a delivery channel; start in-app (toast/bell) before email/push.
7. **PWA/offline support** — `vite-plugin-pwa` + manifest, once core UX above is stable.

The app is intentionally kept single-user — collaboration/sharing is out of scope unless explicitly revisited.
