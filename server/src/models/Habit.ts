import mongoose, { Schema, Document } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: 'Health' | 'Growth' | 'Quit' | 'Social';
  goal: {
    targetValue: number; // e.g., 1 (for a checkbox) or 500 (for ml of water)
    unit: string;        // e.g., "session", "ml", "pages"
    frequency: 'daily' | 'weekly';
    scheduledDays: number[]; // [1, 3, 5] where 1=Mon, 0=Sun
  };
  gamification: {
    basePoints: number;
    lastRelapseDate: Date;
  };
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Health', 'Growth', 'Quit', 'Social'], default: 'Growth' },
  goal: {
    targetValue: { type: Number, default: 1 },
    unit: { type: String, default: 'times' },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    scheduledDays: { type: [Number], default: [1, 2, 3, 4, 5] } // Default Mon-Fri
  },
  gamification: {
    basePoints: { type: Number, default: 10 },
    lastRelapseDate: { type: Date, default: Date.now }
  }
}, { timestamps: true });

const LogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: Date, required: true }, // Normalized to 00:00:00
  value: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 }
});

export const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
export const Log = mongoose.model('Log', LogSchema);