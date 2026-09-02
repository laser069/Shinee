# SHINEE Mobile — Phase 0 + Phase 1 execution plan

## Context

`docs/MOBILE_PLAN.md` commits to a Flutter Android client at full parity with the React web client, reusing the existing Express API. Phases 0 and 1 are the prerequisites: harden the server so a second client can talk to it safely, then stand up `mobile/` with the design system, networking and navigation shell that every later phase composes.

Phase 0 exists because a second client exposes bugs the React client happens to route around: unmatched routes return HTML (kills `jsonDecode` in Dart), `GET /api/tasks?boardId=` has no ownership check, register accepts `isAdmin`, `POST /api/data/import` 413s on Express's 100kb default, and the board list populates every task of every board. Phase 1 exists so Phase 2+ never re-litigate colors, fonts, HTTP, or error shapes.

### Findings that change the doc

| Doc says | Reality |
|---|---|
| "No test suite exists" (`CLAUDE.md`) | Server has vitest + supertest + mongodb-memory-server and 6 spec files (`src/services/*.test.ts`, `src/test/auth.integration.test.ts`, `vitest.config.ts`). Phase 0 gets regression tests cheaply. |
| Phase 0.11 "gives the mobile client a stable 400 shape" | The 400 shape is broken at the root: `validate.middleware.ts:16` returns `errors: error.errors`, but zod is **v4** (`package.json:29`) where the field is `.issues`. Today `errors` is always `undefined`, and `user.controller.ts:35` (`error.errors[0]?.message`) throws on it. Must fix before 0.11 means anything. |
| `fixedDays` "comment says 0=Sunday but the math uses Mon=0" — a real bug | Comment-only. `HabitModal.tsx:116` renders `['M','T','W','T','F','S','S']` at idx 0..6, so stored `fixedDays` is already Mon=0 and `habit.service.ts:127` is correct. Fix `models/Habit.ts:10`; no migration. |
| Phase 1 fonts: "Flutter's variable-font support is weak, copy static TTFs" | Confirmed available — each family has a `static/` subdir (Space Grotesk 5 weights, Sora 8, Syne 5). Bodoni Moda skipped as planned. |

**Toolchain state**: Flutter 3.47.2 stable / Dart 3.13.2 at `C:\src\flutter` — **not on PATH**. `flutter doctor`: Android toolchain **✗ Unable to locate Android SDK**. Blocks `flutter run`; does not block `flutter create` / `analyze` / `test`. Phase 1 therefore opens with an SDK install step.

**Decisions taken with the user**: install Android SDK via command-line tools (no Android Studio); include all four extra server fixes in Phase 0; verify Phase 0 with vitest regression tests.

---

# Phase 0 — Backend hardening (`server/`, additive only)

Nothing here may break `client/`. Order matters: E1 before 0.1, 0.1 before 0.11.

## E1. Zod v4 error field (do first)

- `src/middleware/validate.middleware.ts:11-17` — catch is currently untyped and reads `error.errors`. Narrow with `error instanceof ZodError`, emit `errors: error.issues`, and **re-throw anything that is not a ZodError** into the global handler (today every failure becomes a 400, hiding real 500s).
- `src/controllers/user.controller.ts:35` — same `.errors` → `.issues` fix on the register path.
- Grep for other `.errors` reads before moving on.

## 0.1 + E4. App-level middleware (`src/app.ts`)

Current file is 30 lines and ends at `export default app;` with no 404 and no error handler.

- New `src/middleware/error.middleware.ts` exporting `notFound` and `errorHandler`:
  - `notFound` → `404 {success:false, message:"Route not found: <method> <path>"}`.
  - `errorHandler(err, req, res, next)` maps: `ZodError` → 400 `{success,message,errors:err.issues}`; `JsonWebTokenError`/`TokenExpiredError` → 401; mongoose `CastError`/`ValidationError` → 400; anything else → 500 with a generic message (stack only when `NODE_ENV !== 'production'`). **Every response keeps the `{success, message}` envelope**, including auth failures — `auth.middleware.ts:31,36,45` currently return bare `{message}` with no `success`, a third error shape the Dart client would otherwise have to special-case. Normalize those three too.
- Mount `notFound` then `errorHandler` **after** the six route mounts (`app.ts:23-28`).
- `app.ts:13` → `express.json({ limit: '10mb' })` (**0.5**).
- Import and mount `helmet()` and `compression()` — both are already in `package.json` and never imported (**E4**). `compression` also shrinks the board/stats payloads on mobile data.

## 0.6 CORS from env (`src/app.ts:15-18`, `src/config/env.ts`)

- Add `CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173')` to the schema at `env.ts:7-11`; split on comma, trim.
- `origin: (origin, cb) => cb(null, !origin || list.includes(origin))` — **`!origin` must pass**: native Android sends no `Origin` header. Keep `credentials: true`.
- Note the default list keeps `localhost:3000` (the Vite dev port, `client/vite.config.ts`), so `client/` is unaffected.

## 0.2 Strip `isAdmin` from register

`src/schemas/user.schema.ts:25-28` — delete `isAdmin: z.boolean().default(false).optional()` from `UserRegistrationSchema`. The Mongoose default (`false`) then governs, and `user.controller.ts:20-24` keeps signing `isAdmin` from the persisted doc. Leave `isAdmin` on the response/user schema.

## 0.3 + E2. Ownership hardening

- `src/services/task.service.ts:28-30` — `getTasksByBoard(boardId, userId)` → `Task.find({ boardId, user: userId })`. Update the call at `src/controllers/task.controller.ts:32` to pass `req.user!.id`.
- `src/controllers/task.controller.ts:10-17` (`createTask`) — verify the caller owns `boardId` before `taskService.createTask` pushes into the board (`task.service.ts:17-19`). Reuse `boardService.getBoardById(boardId, userId)`; 404 when it misses.
- `src/services/board.service.ts:26-28` (`deleteBoard`) — currently orphans every `Task` of the board. Delete `Task.deleteMany({ boardId })` in the same flow, and scope the board delete by `user` the way `updateBoardTitle` (`board.service.ts:30-37`) already does.

## 0.4 Date fields accept offsets

`src/schemas/task.schema.ts:33` (`dueDate`) and `:39` (`activeStartTime`) → `z.string().datetime({ offset: true })`. The Flutter client always sends `.toUtc().toIso8601String()`, but accept `+05:30` defensively.

## 0.7 `Board` timestamps

`src/models/Board.ts:3-9` — add `{ timestamps: true }` as the schema's second arg while keeping the existing manual `createdAt`/`updatedAt` fields so nothing reading them breaks. Gives Phase 7's cache something to key staleness on.

## 0.8 Lean board list

`src/services/board.service.ts:13-17` — `getAllBoards(userId, populate = true)`; skip `.populate('tasks')` when false. Controller reads `req.query.populate !== 'false'`, so the **default stays `true`** and `client/` is untouched. Mobile calls `GET /api/boards?populate=false`.

## 0.9 `GET /api/tasks/:id`

New `taskService.getTaskById(id, userId)` (`Task.findOne({_id, user})`) + controller + `router.get('/:id', getTaskById)` in `src/routes/task.route.ts` — declared **after** `GET /`, before `PATCH /:id`. The web `taskService.getTaskById` already calls this non-existent route; Phase 8 notification deep-links need it.

## 0.10 + 0.11 Timezone-safe habit toggle

`src/controllers/habit.controller.ts:32-81` recomputes the Monday inline (`:42-48`), duplicating `habit.service.ts:8-12`'s `calculateMonday`, and the future-date guard at `:58-63` runs in **server local time** — a device in another timezone can toggle into a different week than it renders.

- New `ToggleActivitySchema` in `src/schemas/habit.schema.ts`: `habitId` (required), optional `date`, `dayIndex: z.number().int().min(0).max(6)`, `weekStartDate` (datetime, optional), `tzOffsetMinutes: z.number().int().min(-840).max(840)` optional, plus the existing `value`/`note`/`mood`. Note `dayIndex` is entirely unchecked today.
- Wire `validate(ToggleActivitySchema)` at `src/routes/habit.routes.ts:34` and `validate(CreateBoardSchema)` at `src/routes/board.route.ts:19` (**0.11** — `CreateBoardSchema` exists at `board.schema.ts:18-24` and is imported for its type only).
- Controller: when `weekStartDate` is present, derive `date` from it + `dayIndex` instead of from server `now`. When `tzOffsetMinutes` is present, apply it before the future-date comparison. **Absent → current behaviour verbatim**, so the React client is unaffected.
- Delete the inline Monday math and call `habitService.calculateMonday` (make it public) so there is one implementation.

## E3. `fixedDays` doc contract

`src/models/Habit.ts:10` — comment claims `0 is Sunday`. Change to `0 = Monday … 6 = Sunday` to match the stored data, `habit.service.ts:77`, and `HabitModal.tsx:116`. Code unchanged.

## Deliberately NOT doing

Refresh tokens. JWT is 30 days (`user.controller.ts:20-24`); the client treats any 401 as "clear storage → login".

## Phase 0 verification

New `src/test/mobile-hardening.integration.test.ts` (supertest + mongodb-memory-server, following `src/test/auth.integration.test.ts`):

1. `GET /api/nope` → 404 with `content-type: application/json` and a `success:false` body.
2. Register with `isAdmin: true` → persisted user has `isAdmin === false` and the JWT payload does not claim admin.
3. User B calls `GET /api/tasks?boardId=<A's board>` → `[]`.
4. `POST /api/tasks` with another user's `boardId` → 404/403, and no task is created.
5. `dueDate: '2026-09-01T10:00:00+05:30'` accepted; garbage string → 400 with a **non-empty `errors` array** (locks E1).
6. `GET /api/boards?populate=false` returns boards whose `tasks` are unpopulated ids; no param → populated (locks the `client/` contract).
7. `GET /api/tasks/:id` returns own task, 404 for another user's.
8. `POST /api/habits/toggle` with `dayIndex: 9` → 400; with `{habitId, dayIndex}` only → still works (React-client compatibility); with an explicit `weekStartDate` → writes into that week's `WeeklyLog`.
9. `DELETE /api/boards/:id` leaves no `Task` with that `boardId`.
10. Fixed habit with `fixedDays: [0,2,4]` completing Mon/Wed/Fri sets `isGoalMet` (locks Mon=0).

Then: `cd server && pnpm build && pnpm test && pnpm dev`, and **click the React client through login → board → task create/move → habit toggle → export/import** to prove no regression.

---

# Phase 1 — Foundation: scaffold + design system

## 1.0 Toolchain (new — SDK is missing)

1. Add `C:\src\flutter\bin` to the user PATH (`flutter doctor` flags it explicitly).
2. Install Android SDK command-line tools to `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\` (the `latest` subdir is mandatory or `sdkmanager` fails).
3. `sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "emulator" "system-images;android-36;google_apis;x86_64"`, then `sdkmanager --licenses`.
4. `flutter config --android-sdk %LOCALAPPDATA%\Android\Sdk`; create an AVD via `avdmanager`.
5. Gate: `flutter doctor` shows Android toolchain ✓. Java 26 is already installed.

## 1.1 Scaffold

`flutter create --platforms=android --org com.shinee mobile` at `D:\TaskApp\mobile\` — a third independent project alongside `client/` and `server/`, per the locked decision. Add `mobile/` build outputs to `.gitignore`.

**Dependencies**: add with `flutter pub add` and let pub resolve against Flutter 3.47 / Dart 3.13 — do not hand-write version constraints. Set: `flutter_riverpod` + `riverpod_annotation` + `riverpod_generator`/`build_runner`, `dio`, `freezed` + `json_serializable`, `go_router`, `flutter_secure_storage`, `shared_preferences`, `hive_ce` + `hive_ce_flutter`, `intl`, `fl_chart`. Defer the Phase 6/8 packages (`share_plus`, `file_picker`, `path_provider`, `flutter_local_notifications`, `timezone`, `home_widget`, `connectivity_plus`) to the phases that use them — adding them now only adds resolution risk.

**Structure** (feature-first, as `docs/MOBILE_PLAN.md:69-79`): `core/theme`, `core/widgets`, `core/network`, `core/cache`, `features/<auth|boards|tasks|habits|stats|profile|pomodoro>/{data,domain,presentation}`, plus `router.dart` and `main.dart`. Phase 1 creates the directories and only the `core/` contents.

## 1.2 Design tokens — `core/theme/tokens.dart`

Port `client/src/index.css:29-50` exactly:

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FFFFFF` | `#0A0A0A` |
| `surface` | `#F5F5F5` | `#161616` |
| `fg` | `#0A0A0A` | `#F5F5F5` |
| `border` | `#0A0A0A` | `#F5C842` |
| `accent` | `#F5C842` | `#F5C842` |

Constants (harvested from the web's inline utilities — they are **not** in `index.css`): border widths 4 / 2 / 1; radii 8 / 12 / 16 / 24 / 40; hard shadows `BoxShadow(color: fg, offset: Offset(8,8), blurRadius: 0)` with 12 and 16 variants (web uses 8 for cards, 12 for modals/auth, 16 for `TaskModal.tsx:157`); scrim `fg @ 80%`; danger `#f43f5e` / `#ef4444`; success `#10b981`; tag palette `['#6366f1','#f43f5e','#10b981','#f59e0b','#3b82f6','#a855f7']` — **lowercase, exactly this set**, since `server/src/schemas/task.schema.ts:5,9` enforces it as a `z.enum`. Define it **once** here, unlike the web which duplicates it in `types/task.ts:4` and `HabitModal.tsx:12`.

Expose as `ThemeExtension<BrutalTokens>` with `copyWith`/`lerp`; `app_theme.dart` builds light and dark `ThemeData` carrying it. **Every widget reads the extension — no color literals anywhere.** The web is mid-migration (only App shell, Navbar, Dashboard are tokenized, commit `b22ed5c`); mobile is fully tokenized from day one.

Web quirk not to port: `index.css:69-76` sets `body` from `--primary`/`--secondary`, which never flip in dark — that is why parts of the web app stay light. Drive Flutter's scaffold from `bg`/`fg`.

## 1.3 Fonts

Copy the **static** TTFs from `client/src/assets/*/static/` into `mobile/assets/fonts/` and declare weight-mapped families in `pubspec.yaml`:
- **Space Grotesk** (Light/Regular/Medium/SemiBold/Bold → 300/400/500/600/700) — body, the default `fontFamily`.
- **Sora** (Thin…ExtraBold → 100…800) — all headings and any bold text. Web swaps family on bold (`index.css:59-63`); replicate by making Sora the family on every `w600+` text style in the theme, rather than by trying to reproduce the CSS selector.
- **Syne** (Medium…ExtraBold) — logo only, mirroring `.logo-font` (`index.css:65-67`).
- Skip Bodoni Moda: bundled in `client/src/assets/` but has no `@font-face` and is unused.

## 1.4 Core widgets — `core/widgets/`

Built here so every later phase just composes them: `BrutalCard` (4px border, r24, hard offset shadow, size variant selects the 8/12/16 shadow), `BrutalButton` (primary filled `fg` → pressed `accent`, outline, danger — all with a `scale(0.95)` press animation), `BrutalInput` (4px border, r16, focus tint `accent @ 10%`), `BrutalBottomSheet` (Material sheet in the brutal skin — this is the Android adaptation of the web's `rounded-3xl` modal), `TagChip`, `StatCard`, `EmptyState`, `LoadingRing` (4px `fg @ 10%` ring with an `accent` arc, spinning).

## 1.5 Networking — `core/network/`

- `dio_client.dart`: `baseUrl = '$API_URL/api'`, `API_URL` from `--dart-define` defaulting to `http://10.0.2.2:5000` (emulator loopback; a physical device uses the LAN IP — the server binds all interfaces). Mirrors `client/src/lib/apiClient.ts:5-6`.
- `auth_interceptor.dart`: `onRequest` injects `Authorization: Bearer <token>` from `flutter_secure_storage` (`apiClient.ts:23-32`); `onError` on **401 → wipe storage, `go('/login')`** through a global navigator key (`apiClient.ts:38-49`).
- `api_envelope.dart`: `ApiEnvelope<T>` unwrapping `{success, data, message, errors}`.
- `api_exception.dart`: typed, covering the shapes that survive Phase 0 — validation `{success:false, message, errors:[...]}`, generic `{success:false, message}` — plus a **non-JSON/HTML fallback** kept as a belt-and-braces guard even though 0.1 removes the HTML path.
- Date rule, enforced in one serializer: **always** `dateTime.toUtc().toIso8601String()`.

## 1.6 App shell

- `router.dart` — `go_router` with a `ShellRoute` for the four tabs; board detail, task editor and auth screens are full-screen pushes. The `redirect` guard is stubbed in Phase 1 and wired to `authProvider` in Phase 2.
- Bottom `NavigationBar`: Boards / Habits / Stats / Profile — the Material adaptation of the web's 80px sticky Navbar.
- `AppBar` carrying the `SH[I]NEE` Syne logo chip and the theme toggle.
- `ThemeMode` provider reading `shared_preferences`, seeded from `MediaQuery.platformBrightness` — the Flutter mirror of `client/src/store/themeStore.ts:16-19`. Phase 6 adds persistence of the user's explicit choice.
- Placeholder screens per tab so the shell runs end-to-end.

## Phase 1 verification

- `flutter analyze` clean; `flutter test` green.
- Widget tests for `BrutalTokens` (light/dark values, `lerp`) and each core widget in both themes — these also lock the tokens against drift.
- `flutter run` on the AVD with the server on `10.0.2.2:5000`: shell renders, all four tabs reachable, theme toggle flips **every** surface, `GET /ping` succeeds through `dio_client`, and a deliberately bad route returns a typed `ApiException` (proves Phase 0.1 end-to-end).
- Golden-ish eyeball check against the running React client for border weight, shadow offset and the two font families.

---

## Critical files

**Modify (Phase 0)**: `server/src/app.ts` · `src/config/env.ts` · `src/middleware/validate.middleware.ts` · `src/middleware/auth.middleware.ts` · `src/schemas/{user,task,board,habit}.schema.ts` · `src/services/{task,board,habit}.service.ts` · `src/controllers/{task,habit,user,board}.controller.ts` · `src/models/{Board,Habit}.ts` · `src/routes/{task,board,habit}.route(s).ts`
**Create (Phase 0)**: `src/middleware/error.middleware.ts` · `src/test/mobile-hardening.integration.test.ts`
**Create (Phase 1)**: everything under `mobile/`.

**Source of truth while porting** (`server/API.md` is stale — trust the code): `client/src/index.css` · `client/src/lib/apiClient.ts` · `client/src/store/themeStore.ts` · `client/src/services/*.ts` · `server/src/schemas/*.ts` · `server/src/models/*.ts`.

## Git

Current branch is `feature/dark-mode`. Per `CLAUDE.md`, branch before starting: `feature/mobile-phase0` off the base for the server work, then `feature/mobile-phase1` for the scaffold. Commit as work progresses; PR each phase rather than merging directly.
