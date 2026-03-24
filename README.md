# SHINEE - Advanced Task & Habit Management

SHINEE is a premium, high-performance task management and habit tracking application designed for ultimate productivity. Built with a modern tech stack (React, Express, MongoDB), it features a stunning brutalist UI with bold borders, real-time board management, and gamified habit tracking.

## 🚀 Key Features

### 📋 Kanban Boards
- Fully responsive drag-and-drop workspace
- Optimistic UI updates for a snappy experience
- Automatic sorting (newest tasks first)
- Per-column vertical scrolling for high-density task management
- Create, edit, and delete tasks with ease
- Column management (add, rename, delete columns)

### 🎯 Habit Tracker
- **Notion-Inspired Grid**: A professional, light-mode database view for your weekly routines
- **Smart Scheduling**: Customize which days a habit is active; visual indicators show scheduled vs unscheduled days
- **Interactive Toggling**: Click any day in the weekly grid to log progress with optimistic UI updates
- **Select All Days**: Quick checkbox to select all 7 days at once when in fixed frequency mode
- **Progress Formulas**: Automatic weekly completion calculation with real-time horizontal progress bars
- **Color-Coded**: Custom color categorisation for every habit
- **Streak Tracking**: Daily and weekly streak counters with visual badges
- **XP & Multipliers**: Earn discipline points (XP) with streak-based multipliers
- **Real-time Updates**: Points and streaks automatically update when habits are completed or uncompleted
- **Delete Habits**: Easy delete functionality with confirmation modal

### 🔐 User Authentication
- **JWT Authentication**: Secure stateless login and session management
- **Registration & Login**: Clean, styled authentication forms with validation

### 🔒 Secure Infrastructure
- **Input Validation**: Robust data integrity using Zod schemas
- **Protected Routes**: Secure API endpoints with authentication middleware
- **API Documentation**: Comprehensive [API.md](server/API.md) for developers

## 🎮 Gamification System

### Points & Multipliers
- Earn 10 base points for each habit completion
- Multiplier increases by 0.1 for every 7 days of consecutive streak
- Points are automatically deducted when a habit is uncompleted
- Daily streak resets to 0 when a habit is unchecked

### Streaks
- Automatic daily streak tracking
- Weekly streak monitoring
- Longest streak record keeping

## 🛠️ Technology Stack

- **Client**: React 19, Tailwind CSS, Lucide React, @hello-pangea/dnd, TypeScript
- **Server**: Node.js, Express, MongoDB (Mongoose), Zod, JWT
- **Dev Tools**: Vite, TypeScript, ESLint

## 🏁 Getting Started

1. **Clone the repository**
2. **Setup Server**: `cd server && npm install && npm run dev`
3. **Setup Client**: `cd client && pnpm install && pnpm run dev`
4. **Environment**: Ensure `.env` is configured in the server root with MongoDB connection string

## 📁 Project Structure

```
TaskApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── ...
│   └── ...
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── services/      # Business logic
│   │   └── ...
│   └── ...
└── README.md
```

## 🎨 UI Design

The application features a distinctive brutalist design aesthetic:
- Bold black borders (4px)
- Sharp corners with heavy shadow effects
- Yellow accent color (#F5C842)
- Black and white color scheme
- Custom fonts (Bodoni Moda for headings, Syne for body)
- High-contrast, attention-grabbing elements

---

Built with ❤️ using modern web technologies
