# NEXUS - Advanced Task & Habit Management

NEXUS is a premium, high-performance task management and habit tracking application designed for ultimate productivity. Built with a modern tech stack (React, Express, MongoDB), it features a stunning glassmorphic UI, real-time board management, and gamified habit tracking.

## 🚀 Key Modules

### 📋 Kanban Boards
- Fully responsive drag-and-drop workspace.
- Optimistic UI updates for a snappy experience.
- Automatic sorting (newest tasks first).
- Per-column vertical scrolling for high-density task management.

### 🎯 Habit Tracker
- **Smart Progress Tracking**: Supports binary (Yes/No), numeric (Quantity), and countdown tracking.
- **Gamified Experience**: Real-time streak calculation and points system.
- **Sobriety/Quit Support**: Specialized tools for reset tracking (e.g., quitting social media).
- **History & Stats**: Detailed insights into your daily and weekly performance.

### 🔒 Secure Infrastructure
- **JWT Authentication**: Secure stateless login and session management.
- **Input Validation**: Robust data integrity using Zod schemas.
- **API Documentation**: Comprehensive [API.md](server/API.md) for developers.

## 🛠️ Technology Stack

- **Client**: React 19, Tailwind CSS 4, Lucide React, @hello-pangea/dnd.
- **Server**: Node.js, Express, MongoDB (Mongoose), Zod.
- **Dev Tools**: Vite, TypeScript, ESLint.

## 🏁 Getting Started

1. **Clone the repository**
2. **Setup Server**: `cd server && npm install && npm run dev`
3. **Setup Client**: `cd client && npm install && npm run dev`
4. **Environment**: Ensure `.env` is configured in the server root.
