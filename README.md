# SHINEE — Advanced Task & Habit Management

SHINEE is a full-stack productivity platform built to streamline project work and daily routines in one elegant, brutalist interface.

The app pairs fast, token-based authentication with rich Kanban board management and a weekly habit tracker backed by MongoDB persistence.

## ✨ What’s Included

### 📋 Boards & Task Workflow
- Create, rename, and delete project boards
- Build tasks inside boards with title, description, workflow status, due date, and time goals
- Drag and drop tasks between `Backlog`, `Active`, and `Resolved`
- Automatic task time tracking when work moves into `Active`
- Countdown badges for deadlines and goal progress bars for target duration
- Soft state handling in the UI for responsive board interaction

### 🎯 Habit Management
- Weekly habit grid with Monday–Sunday toggles
- Flexible or fixed habit cadence support
- Fixed habits can be scheduled on exact weekdays
- Flexible habits can track a target count per week
- Habit toggle action updates weekly logs and streaks
- Habit dashboard shows XP, streak totals, average completion, and today’s progress
- Create, edit, archive, or delete routines from the habit modal

### 🔐 Authentication & User Session
- Email/password registration and login
- JWT-based protected routes across the frontend and backend
- Persistent session token storage in `localStorage`
- Profile page with account details and logout support

### 🧠 Backend API & Data Integrity
- Express API with separate `users`, `boards`, `tasks`, and `habits` routes
- Mongoose models for `User`, `Board`, `Task`, `Habit`, and `WeeklyLog`
- Zod validation middleware for request payloads
- Protected REST endpoints using JWT middleware
- Habit history stored per-week with daily completion records

## 🏗️ Tech Stack

- Client: React 19, TypeScript, Tailwind CSS, React Router, axios, Zustand
- Drag-and-drop: `@hello-pangea/dnd`
- Server: Node.js, Express, TypeScript, Mongoose, Zod, JWT, bcrypt
- Tools: Vite, ESLint, pnpm

## 🚀 Run Locally

### 1. Server
```bash
cd server
pnpm install
pnpm dev
```

### 2. Client
```bash
cd client
pnpm install
pnpm run dev
```

### 3. Environment
Create a `.env` file in `server/`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/shinee
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

Optionally, set `VITE_API_URL` in `client/.env` if the API is hosted elsewhere:
```env
VITE_API_URL=http://localhost:5000
```

## 🧩 API Overview

Base API path: `http://localhost:5000/api`

- `POST /users/register` — register a new user
- `POST /users/login` — login and receive a JWT
- `GET /users/profile` — current user profile

- `GET /boards` — list user boards
- `POST /boards` — create a board
- `GET /boards/:id` — fetch a board with tasks
- `PATCH /boards/:id` — rename a board
- `DELETE /boards/:id` — delete a board

- `GET /tasks` — list user tasks
- `POST /tasks` — create a task
- `PATCH /tasks/:id` — update task status, due date, or time goals
- `DELETE /tasks/:id` — delete a task

- `GET /habits` — retrieve the weekly habit dashboard
- `POST /habits` — create a new habit
- `POST /habits/toggle` — toggle a habit day completion
- `PATCH /habits/:id` — update habit settings
- `PATCH /habits/:id/archive` — archive a habit
- `DELETE /habits/:id` — delete a habit

## 📁 Project Structure

```
TaskApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI controls, modals, boards, habit tracker
│   │   ├── pages/          # Route pages and views
│   │   ├── services/       # API service layer
│   │   ├── context/        # auth state management
│   │   ├── lib/            # axios client + auth helpers
│   │   └── types/          # shared TypeScript models
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # request handlers
│   │   ├── services/       # domain logic
│   │   ├── routes/         # route definitions
│   │   ├── models/         # Mongoose schemas
│   │   ├── schemas/        # Zod validation
│   │   ├── middleware/     # auth + validation middleware
│   │   ├── config/         # env and DB setup
│   │   └── server.ts       # app entrypoint
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🎨 Design Notes

SHINEE ships with a bold brutalist aesthetic:
- heavy black borders and strong contrast
- bright yellow accent highlights
- chunky rounded cards and minimalistic typography
- motion-enhanced transitions for a tactile feel

## 📘 Additional Resources
- API reference: `server/API.md`
- App health check: `GET /ping`

---

Built for productivity, tracking, and finishing more with less friction.
