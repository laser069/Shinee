# SHINEE Mobile — Flutter App Plan

> **On approval, first action = copy this file to `D:\TaskApp\docs\MOBILE_PLAN.md`** (plan mode only permits editing this scratch plan file).

---

## Context

SHINEE today is a React 19 + Vite SPA (`client/`) talking to an Express + Mongoose API (`server/`). The API is already mobile-friendly in the way that matters most: auth is a pure `Authorization: Bearer <jwt>` header with **no cookies, no CSRF, no session state** (`server/src/middleware/auth.middleware.ts:19-21`), and every controller returns a `{success, data, message}` envelope. So a Flutter client can reuse the backend essentially as-is.

Goal: an Android app at **full feature parity** with the web client — auth, boards, Kanban tasks with server-authoritative time tracking, weekly habit grid with streaks/XP, stats, profile + backup/restore, dark mode — plus mobile-native extras (local notifications, home-screen widget, haptics, share), and a local read cache so the app opens instantly and stays readable offline.

Decisions locked with the user:
- **Scope:** full parity + mobile extras.
- **Backend:** small *additive* changes allowed; must not break the React client.
- **Offline:** read cache only (cache last-fetched data; writes require network).
- **Platform / state:** Android only, **Riverpod**.
- **Location:** `D:\TaskApp\mobile\` (third independent project, alongside `client/` and `server/`).
- **Timer:** server-authoritative (no foreground service).
- **Design:** brutalist palette/type/borders 1:1, but Material 3 navigation, bottom sheets and ripples where Android users expect them.

---

## Phase 0 — Backend hardening (server, additive only) ✅ DONE

These are prerequisites; several are correctness/security bugs that a second client will expose. None break `client/`.

| # | Change | File | Why mobile needs it |
|---|---|---|---|
| 0.1 | Add JSON 404 + global error handler after route mounts | `server/src/app.ts:20-28` | No handler exists today → unmatched routes return Express's **HTML** error page, which crashes `jsonDecode` in Dart. Every Dart error path depends on this. |
| 0.2 | Strip client-settable `isAdmin` from register | `server/src/schemas/user.schema.ts:25-28` | Privilege escalation: anyone can register as admin today. |
| 0.3 | Filter tasks by `user` in `getTasksByBoard` | `server/src/services/task.service.ts:28-29` (called from `task.controller.ts:32`) | `GET /api/tasks?boardId=` has **no ownership check** — any authed user can read any board's tasks. |
| 0.4 | `z.string().datetime({ offset: true })` for `dueDate` / any date field | `server/src/schemas/task.schema.ts:33,39` | Default Zod datetime rejects `+05:30` offsets. Client will always send `.toUtc().toIso8601String()`, but accept offsets defensively. |
| 0.5 | `express.json({ limit: '10mb' })` | `server/src/app.ts:12` | `POST /api/data/import` 413s on the Express 100kb default. |
| 0.6 | CORS origin from env allowlist instead of hardcoded `http://localhost:3000` | `server/src/app.ts:16` | Irrelevant for native Android, but unblocks a future Flutter-web target and LAN device testing. Keep `localhost:3000` in the default list. |
| 0.7 | Add `timestamps: true` to `Board` (keep the existing manual fields) | `server/src/models/Board.ts:3-9` | `updatedAt` is never bumped on update → cache-staleness detection has nothing to key on. |
| 0.8 | `GET /api/boards?populate=false` → lean list without embedded tasks | `server/src/services/board.service.ts:15` | Board list currently populates **every task of every board**; unbounded payload on mobile data. Default stays `true` so `client/` is unaffected. |
| 0.9 | `GET /api/tasks/:id` route | `server/src/routes/task.route.ts` | The web `taskService.getTaskById` already calls a route that doesn't exist. Useful for notification deep-links. |
| 0.10 | Accept `weekStartDate` (or `tzOffsetMinutes`) on `POST /api/habits/toggle` | `server/src/controllers/habit.controller.ts:35-63`, `services/habit.service.ts:8-12` | Week boundary + the future-date guard are computed in **server local time**. A device in another timezone can toggle into a different week than it renders. Fall back to current server behaviour when the field is absent. |
| 0.11 | Zod schema on `POST /api/boards` and `POST /api/habits/toggle` | `board.route.ts:19`, `habit.routes.ts:34` | Both bypass `validate` today; `CreateBoardSchema` already exists unused (`board.schema.ts:18-24`). Gives the mobile client a stable 400 shape. |

**Deliberately NOT doing:** refresh tokens. JWT is 30 days (`user.controller.ts:20-24`); the client will treat any 401 as "clear storage → login". Adding refresh is a larger auth change and can be a later phase if session length becomes a complaint.

**Also fix while in `habit.service.ts`:** the `fixedDays` doc comment says 0=Sunday (`models/Habit.ts:10`) but the toggle math uses **Mon=0..Sun=6** (`habit.service.ts:77`). Correct the comment; Mon=0 is the real contract and the Flutter client will follow it.

---

## Phase 1 — Foundation: scaffold + design system ✅ DONE

Create `mobile/` (Flutter, Android only — `flutter create --platforms=android`).

**Dependencies**
```yaml
flutter_riverpod + riverpod_annotation/riverpod_generator   # state
dio                                                          # http + interceptors
freezed + json_serializable                                  # models
go_router                                                    # routing + deep links
flutter_secure_storage                                       # JWT
shared_preferences                                           # theme mode, prefs
hive_ce + hive_ce_flutter                                    # read cache (JSON blobs, keyed by endpoint)
flutter_local_notifications + timezone                       # Phase 8
home_widget                                                  # Phase 8
share_plus, file_picker, path_provider                       # export/import + share
intl                                                         # date formatting
fl_chart                                                     # stats charts (Recharts equivalent)
```

**Structure** (feature-first, mirrors the server's 4-layer split):
```
mobile/lib/
  core/theme/      tokens.dart, app_theme.dart, brutal_theme_extension.dart
  core/widgets/    brutal_card, brutal_button, brutal_input, brutal_modal,
                   tag_chip, stat_card, empty_state, loading_ring
  core/network/    dio_client.dart, auth_interceptor.dart, api_envelope.dart, api_exception.dart
  core/cache/      cache_box.dart (Hive), cached_query.dart
  features/auth|boards|tasks|habits|stats|profile|pomodoro/
      data/ (dto + service)  domain/ (model)  presentation/ (screens + widgets + providers)
  router.dart  main.dart
```

**Design tokens** — port `client/src/index.css:29-57` verbatim into a `ThemeExtension<BrutalTokens>`:

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FFFFFF` | `#0A0A0A` |
| `surface` | `#F5F5F5` | `#161616` |
| `fg` | `#0A0A0A` | `#F5F5F5` |
| `border` | `#0A0A0A` | `#F5C842` |
| `accent` | `#F5C842` (constant) | `#F5C842` |

Constants: border widths 4 / 2 / 1 px; radii 8 / 12 / 16 / 24 / 40; hard shadow `BoxShadow(color: fg, offset: Offset(8,8), blurRadius: 0)` with 12px and 16px variants; danger `#f43f5e` / `#ef4444`; success `#10b981`; tag palette `#6366f1 #f43f5e #10b981 #f59e0b #3b82f6 #a855f7` (**server enforces this exact lowercase set** — `server/src/schemas/task.schema.ts:5,9`; define it **once** in `core/theme/tokens.dart`, unlike the web which duplicates it in `types/task.ts:4` and `HabitModal.tsx:12`).

> Note: the web app is **mid-migration** — only App shell, Navbar and Dashboard use tokens (commit `b22ed5c`); everything else hardcodes light colours. Flutter should be fully tokenized from day one, so mobile dark mode is complete where web's isn't.

**Fonts** — copy the **static** per-weight TTFs from `client/src/assets/` (Flutter's variable-font support is weak):
- Space Grotesk (300–700) → body / default
- Sora (100–800) → all headings and any bold text (web rule `index.css:59-63` swaps family on bold; replicate by making Sora the family for `w600+` text styles)
- Syne (100–900) → logo only
- Skip Bodoni Moda (bundled but unused).

**Core widgets** to build here so every later phase just composes them: `BrutalCard` (4px border + hard offset shadow + radius), `BrutalButton` (primary = filled `fg`→hover/press `accent`, outline, danger — all with `scale(0.95)` press animation), `BrutalInput` (4px border, r16, focus tint `accent @ 10%`), `BrutalBottomSheet` (Material sheet wearing the modal's brutal skin), `TagChip`, `StatCard`, `LoadingRing` (`border-4 fg/10 + top accent`, spinning).

**Networking** — `dio_client.dart`:
- `baseUrl = ${API_URL}/api`, `API_URL` from `--dart-define` (default `http://10.0.2.2:5000` for the Android emulator; the server binds all interfaces so a physical device uses the LAN IP).
- `onRequest`: inject `Authorization: Bearer <token>` from secure storage — mirrors `client/src/lib/apiClient.ts:23-32`.
- `onError`: **401 → clear storage, `go('/login')`** via a global navigator key — mirrors `apiClient.ts:38-49`.
- `ApiEnvelope<T>` unwraps `{success, data, message, errors}`; a typed `ApiException` carries the three inconsistent server error shapes (Zod `{success,message,errors}`, auth `{message}` with no `success`, generic `{success,message}`) plus a non-JSON/HTML fallback.
- **Always** send dates as `dateTime.toUtc().toIso8601String()`.

**Navigation** (Material adaptation of the 80px sticky Navbar): bottom `NavigationBar` with Boards / Habits / Stats / Profile; top `AppBar` carrying the `SH[I]NEE` Syne logo chip and the theme toggle. Board detail and auth screens are full-screen pushes.

---

## Phase 2 — Auth ✅ DONE

Screens: Splash (rehydrate) → Login → Register → shell.

- `POST /api/users/login` and `/register` both return `{user, token}` and **auto-login on register** (`user.controller.ts:13-39`).
- Store JWT in `flutter_secure_storage` (upgrade over the web's `localStorage`), user JSON in `shared_preferences`. Rehydrate on boot with a loading gate, mirroring `AuthContext.tsx:29-47`; malformed stored JSON → logout.
- `authProvider` (Riverpod `Notifier`) exposes `AuthState.{loading, authenticated(user, token), unauthenticated}`; `go_router` `redirect` guards every non-auth route.
- Register form must mirror the server rules exactly (`user.schema.ts:19-23`): name 2–50, email, password ≥8 with ≥1 uppercase and ≥1 digit. Port the 3-segment password strength meter.
- Port entrance animations: fade + slide-from-top (login) / slide-from-bottom (register), 700ms.

---

## Phase 3 — Boards + Kanban tasks + timer ⬜ NEXT

**Boards** (`DashboardPage` equivalent): `GET /api/boards?populate=false`, single-column card list (web's grid doesn't fit a phone). Board card = `BrutalCard` with filled `fg` icon tile holding an accent glyph, uppercase black title, created date, hover→press lift. Inline create via bottom sheet; delete via confirm sheet. `POST/PATCH/DELETE /api/boards`.

**Board detail** — the biggest UI departure from web. Web uses three 384px columns side-by-side (`BoardDetailsPage.tsx:244-292`); on a phone use a **`TabBar` of Backlog / Active / Resolved** (status `todo` / `inprogress` / `done`) with a swipeable `TabBarView`, each tab a vertical task list. Keep the tab labels in `text-[10px] font-black uppercase tracking-[0.2em]` styling with a per-tab count.

**Moving a task between columns** — no drag-and-drop across tabs on a phone. Instead:
- Long-press a card → status action sheet (Backlog / Active / Resolved), **plus** a `Dismissible` horizontal swipe as the fast path (swipe right = advance status, swipe left = delete with confirm).
- **Reorder within a list** via `ReorderableListView` (visual only — the API has no order field).
- Keep the web's **optimistic update + rollback on failure** pattern (`BoardDetailsPage.tsx:183-202`): mutate local state, PATCH, restore the saved list on error.

**Task card**: uppercase title, `DeadlineCountdown` pill (recompute on a 60s timer; `Nd`/`Nh`/`Nm`/`Expired`; turns `#f43f5e` with white text under 12h), 2-line description, tag chips, subtask badge `n/m`, and `TaskAnalytics` — a 1-second ticker showing elapsed time with a `h-4` bordered progress bar filled `fg` → `accent` when projected late → `#f43f5e` when over `targetDuration`.

**Timer (server-authoritative, as decided)**: the client **never** sends `totalTimeSpent` or `activeStartTime` — the server accrues them purely from `status` transitions. Elapsed = `totalTimeSpent + (now - activeStartTime)` computed locally each tick. This survives app kill for free and needs no background work; **cancel every `Timer` on dispose and on `AppLifecycleState.paused`**, recomputing from `activeStartTime` on resume.

**Task editor** — full-screen route (the web's `rounded-[2.5rem]` modal is too big for a sheet): title, description, allocated time (number + M/H/D unit), workflow state, deadline picker with **+2H / +2D / Clear** quick chips, tag composer (name + the 6-swatch palette), `SubtaskList` (accent-filled progress bar, checkbox rows, strikethrough when done, add-on-submit). `POST /api/tasks` requires `boardId` (`task.controller.ts:12-14`); `PATCH /api/tasks/:id` takes any subset.

**Tag filter**: derive the unique tag set client-side from the loaded tasks (as `TagFilterBar` does) — no server call. Multi-select chips + Clear; non-matching chips drop to 40% opacity.

---

## Phase 4 — Habits

`GET /api/habits` returns the **dashboard**, not a plain list: `[{habit, currentLog}]` (`habit.controller.ts:19-22`).

**Data shape gotchas for Dart:**
- `WeeklyLog.days` serializes as a **JSON object** keyed `"0".."6"`, not an array → decode as `Map<String, DayEntry>`.
- Indexing is **Mon=0 … Sun=6** everywhere (`habit.service.ts:77`), and `weekStartDate` is Monday 00:00. Compute today's index as `(DateTime.now().weekday - 1)`.
- `Habit` has **no `updatedAt`** (no `timestamps` on the schema) — cache invalidation must use `weekStartDate` + a local fetch timestamp.
- `POST /api/habits` **requires `frequencyType`** explicitly (no Zod default, unlike the Mongoose default) — omitting it 400s.
- Archive and delete return **no `data`** — update optimistically.

**Layout**: the web's fixed-width 7-column spreadsheet (`WeeklyHabitTracker.tsx`) doesn't fit a phone. Use a **habit-per-card list**: each `BrutalCard` shows the uppercase name, a flame + `Nd streak` line, a row of 7 day checkboxes (`w-6 h-6` r8, 2px border — filled `fg` with a white check when done; today ringed in `accent`; **future days disabled**, `idx > todayIdx`; unscheduled days greyed), and `timesCompleted/goalCount` with a small accent progress bar. Offer a landscape/tablet fallback to the true grid later if wanted.

**Toggle**: `POST /api/habits/toggle` with `{habitId, dayIndex}` (plus `weekStartDate` once Phase 0.10 lands). Optimistic flip + haptic; roll back and re-fetch on error, since streak/multiplier/XP math is server-side (`updateStreaksAndMultiplier` / `revertStreaksAndPoints`).

**KPI strip** (4-up, computed **client-side** from the dashboard payload, exactly as `HabitsDashboard.tsx` does): Completion %, Total Streak, Discipline XP, Today `n/total`.

**Habit editor sheet**: name, a Flexible|Fixed segmented control (selected = solid `fg`), then either 7 day-toggle buttons + "Every Day" (fixed) or a 1–7 weekly goal (flexible). Match the web client's normalization (`habitService.ts:16-19`): drop `fixedDays` when flexible; when fixed, set `goalCount = fixedDays.length`.

---

## Phase 5 — Stats

`GET /api/stats/overview?weeks=8` (server clamps to 26) → `{taskStats, habitStats}`.

Screen: 8 KPI tiles in a 2-column `BrutalCard` grid (the web's `divide-x-2` 4-up strip is too wide for a phone) + two `fl_chart` cards + the habit breakdown list.
- **Task status bar chart**: fill `#F5C842`, 2px `#0A0A0A` stroke, top radius 6, dashed grid `#0A0A0A` @ 10%.
- **Habit weekly trend line**: 3px `#0A0A0A` line, dots r4 filled `#F5C842` with `#0A0A0A` stroke.
- **Breakdown rows**: colour dot, name, `h-2` completion bar, streak, XP, separated by 2px `fg/10` dividers.
- Add a weeks selector (4 / 8 / 12 / 26) — cheap win the web lacks.
- **Charts must read correctly in dark mode**: drive every stroke/fill from the theme extension, not literals.

---

## Phase 6 — Profile, backup/restore, theme

- Account info card (name, email, pulsing online dot, member-since from `createdAt`), fed by `GET /api/users/profile`.
- **Export**: `GET /api/data/export` → write JSON to a temp file via `path_provider` as `shinee-backup-YYYY-MM-DD.json` → `share_plus` (Android share sheet replaces the web's `<a download>`).
- **Import**: `file_picker` → parse → `POST /api/data/import` with `{...payload, mode}`. `merge` is one tap; **`replace` is destructive and must sit behind a typed/explicit confirm sheet**, as `ProfilePage.tsx:216-225` does. Show the returned `{boards, tasks, habits, weeklyLogs}` counts.
- **Theme**: `ThemeMode` persisted in `shared_preferences`, defaulting to `MediaQuery.platformBrightness` — the Flutter mirror of `store/themeStore.ts` (key `theme-storage`, `prefers-color-scheme` seed). Toggle lives in the `AppBar`.
- Logout: clear secure storage + prefs, cancel scheduled notifications, clear the Hive cache, redirect to login.

**Pomodoro** (parity — the web renders it globally when authed, `App.tsx:20`): port `store/pomodoroStore.ts` semantics exactly. Persist `phase`, `isRunning`, `remainingSeconds`, **absolute `endsAt`**, `cycleCount`, `linkedTaskId`, settings (25/5/15, long break every 4). The absolute-`endsAt` design (rather than decrementing a counter) is what makes it survive backgrounding — critical on Android. Surface it as a collapsible bottom-anchored card or a `Focus` entry in the nav. Preserve the side effect at `PomodoroWidget.tsx:21-24`: starting/stopping a focus phase PATCHes the linked task to `inprogress`/`todo`, which is what drives server-side time accrual.

---

## Phase 7 — Offline read cache

Hive box storing raw response JSON keyed by endpoint + params, with a `fetchedAt` stamp.

- `cachedQuery<T>(key, fetcher, decoder)`: emit cached data immediately (instant cold start), fire the network request, emit fresh data on success; on network failure keep the cached data and surface a "showing offline data · <relative time>" banner.
- Cache: boards list, per-board tasks, habits dashboard, stats overview, user profile.
- **Writes require network** (per the user's decision). When offline, disable mutating controls and show a clear "You're offline" snackbar rather than silently failing or queueing.
- Invalidate the relevant keys after every successful mutation; wipe the whole box on logout.
- `connectivity_plus` drives the offline banner and the disabled-write state.

---

## Phase 8 — Mobile extras

**Local notifications** (`flutter_local_notifications` + `timezone`):
- Daily habit reminder at a user-set time, listing today's incomplete habits. Requires `POST_NOTIFICATIONS` runtime permission (Android 13+) and `SCHEDULE_EXACT_ALARM` handling.
- Task due-date alerts scheduled from `dueDate` (e.g. 1h before + at due). Reschedule on create/edit, cancel on delete or completion.
- Notification tap → deep-link via `go_router` to the task or the habits screen (this is where Phase 0.9's `GET /api/tasks/:id` earns its keep).

**Home-screen widget** (`home_widget` + a small Kotlin `AppWidgetProvider` + `RemoteViews` layout):
- Shows today's habit completion (`n/m` + the 7-day dot row) and the active task with its accrued time.
- Data is pushed from Dart via `HomeWidget.saveWidgetData` on every relevant mutation and on app resume; widget taps deep-link into the app. Skin it in the brutalist palette (black card, 4px border, yellow accent).

**Haptics**: `HapticFeedback.selectionClick()` on habit toggle and subtask check; `mediumImpact()` on task status change and task completion; `heavyImpact()` on a destructive confirm.

**Share**: share a task as formatted text (title, deadline, subtask progress) and share the export JSON, both via `share_plus`.

---

## Phase 9 — Release polish

- Responsive checks at 360dp width and on tablets; verify text scaling at 200%.
- Restore visible focus indicators — the web replaced focus rings with a yellow tint (`outline-none` + `focus:bg-[#F5C842]/10`), an accessibility regression worth not porting.
- Contrast audit of `accent`-on-`bg` in both themes.
- App icon + splash (`flutter_native_splash`) in the brutalist black/yellow style.
- Release signing config, `--dart-define` for the production API URL, ProGuard rules.
- Widget tests for the theme extension and the brutal core widgets; unit tests for date/week math (Mon=0 indexing, UTC serialization, elapsed-time computation) — these are where the bugs will actually live.

---

## Critical files

**To modify (Phase 0, server):**
`src/app.ts` · `src/schemas/user.schema.ts` · `src/schemas/task.schema.ts` · `src/services/task.service.ts` · `src/services/board.service.ts` · `src/models/Board.ts` · `src/controllers/habit.controller.ts` · `src/services/habit.service.ts` · `src/routes/task.route.ts` · `src/routes/board.route.ts` · `src/routes/habit.routes.ts`

**To create (Phase 1+, mobile):** everything under `mobile/lib/` per the structure above.

**To read as the source of truth while porting** (do **not** trust `server/API.md` — it is stale):
`client/src/index.css` (tokens) · `client/src/lib/apiClient.ts` + `AuthContext.tsx` (auth wiring) · `client/src/services/*.ts` (exact call shapes) · `client/src/components/WeeklyHabitTracker.tsx` (habit semantics) · `client/src/pages/BoardDetailsPage.tsx` (timer + optimistic-update patterns) · `client/src/store/pomodoroStore.ts` (absolute-`endsAt` timer) · `server/src/schemas/*.ts` and `server/src/models/*.ts` (real contracts).

---

## Verification

**Phase 0:** `cd server && pnpm build && pnpm dev`. Then confirm: `curl` an unknown route returns JSON not HTML; register with `isAdmin:true` and verify the created user is not admin; user B gets an empty list from `GET /api/tasks?boardId=<user A's board>`; a `+05:30` `dueDate` is accepted; **run the existing React client through login → board → task → habit toggle → export/import to prove nothing regressed.**

**Per mobile phase:** `cd mobile && flutter run` on an emulator with the server on `10.0.2.2:5000`.
- P2: register → auto-login → kill the app → reopen still authed; corrupt the stored token → forced to login on the next call.
- P3: create a task, move it to Active, watch the timer tick, background the app 2 minutes, resume, and confirm elapsed matches wall-clock (proves server-authoritative accrual); force an API failure on a status change and confirm the optimistic rollback.
- P4: toggle each of the 7 days, confirm streak/XP match what the web shows for the same account; confirm future days are disabled; confirm a device in another timezone lands in the right week.
- P5: cross-check every KPI against `/stats` in the browser for the same account.
- P6: export → verify the shared JSON round-trips through `merge` import; toggle theme and confirm **every** screen responds (mobile should be fully tokenized even though web isn't).
- P7: load data online, enable airplane mode, cold-start, and confirm cached data renders with the offline banner and writes are disabled.
- P8: schedule a reminder 2 minutes out and confirm it fires and deep-links; add the widget and confirm it updates after a habit toggle.
- Throughout: `flutter analyze` clean; `flutter test` for theme, core widgets, and date/week math.
