import mongoose, { Schema, Document } from "mongoose";

// models/Habit.ts

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: 'Health' | 'Growth' | 'Quit' | 'Social' | 'Finance' | 'Mind';
  isArchived: boolean;
  ui: {
    icon: string;
    color: string;
  };
  goal: {
    type: 'boolean' | 'numeric';
    targetValue: number;
    unit: string;
    frequency: 'daily' | 'weekly';
    scheduledDays: number[];
    weeklyTarget: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  reminders: {
    enabled: boolean;
    time: string;
  };
  // UPDATE THIS SECTION
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    lastCompletedDate?: Date;
    totalXP: number;      // <--- Add this
    multiplier: number;   // <--- Add this
  };
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, default: 'Growth' },
  isArchived: { type: Boolean, default: false },
  ui: {
    icon: { type: String, default: '🎯' },
    color: { type: String, default: 'indigo' }
  },
  goal: {
    type: { type: String, enum: ['boolean', 'numeric'], default: 'boolean' },
    targetValue: { type: Number, default: 1 },
    unit: { type: String, default: 'times' },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    scheduledDays: { type: [Number], default: [] },
    weeklyTarget: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  },
  reminders: {
    enabled: { type: Boolean, default: false },
    time: { type: String }
  },
  // Add this to your Habit Schema stats
  stats: {
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    multiplier: { type: Number, default: 1.0 } // 1.0x, 1.2x, 1.5x etc.
  }
}, { timestamps: true });

// ENHANCED LOG: Added "Notes" for the daily reflection
const LogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  note: { type: String }, // "Felt great today!", "Hard to start but finished"
  mood: { type: Number, min: 1, max: 5 }, // 1-5 star mood rating
  pointsEarned: { type: Number, default: 0 }
});

export const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
export const Log = mongoose.model('Log', LogSchema);