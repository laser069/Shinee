import mongoose from "mongoose";

// --- 1. THE LOG SCHEMA (The daily data) ---
// Each time you walk, code, or call someone, a new entry is created here.
const LogSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date().setHours(0,0,0,0) },
  value: { type: Number, required: true }, // e.g., 8000 steps or 2 problems
  pointsEarned: { type: Number, default: 0 },
  multiplierAtTime: { type: Number, default: 1 }
}, { timestamps: true });

// --- 2. THE HABIT SCHEMA (The definition) ---
// This stores WHAT you are tracking and your current streak/multipliers.
const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Health', 'Growth', 'Quit', 'Social', 'Milestone'], 
    required: true 
  },
  trackingType: {
    type: String,
    enum: ['numeric', 'binary', 'countdown'],
    required: true
  },
  goal: {
    targetValue: { type: Number, default: 1 }, 
    unit: { type: String }, // "steps", "pages", etc.
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' }
  },
  gamification: {
    basePoints: { type: Number, default: 10 },
    currentStreak: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lastRelapseDate: { type: Date, default: Date.now } // Specifically for 'Quit' category
  }
}, { timestamps: true });

// Exporting both Models
export const Habit = mongoose.model("Habit", HabitSchema);
export const Log = mongoose.model("Log", LogSchema);