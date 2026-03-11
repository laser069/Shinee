import { Schema, model, Document, Types } from 'mongoose';

interface IDayEntry {
  completed: boolean;
  syncedAt?: Date;
}

export interface IWeeklyLog extends Document {
  habitId: Types.ObjectId;
  weekStartDate: Date; // Should always be the Monday of that week (00:00:00)
  
  // Using a Record for 0-6 index access
  days: Record<number, IDayEntry>;
  
  stats: {
    timesCompleted: number;
    isGoalMet: boolean;
    bonusAchieved: boolean;
  };
}

const weeklyLogSchema = new Schema<IWeeklyLog>({
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  weekStartDate: { type: Date, required: true },

  days: {
    0: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Sun
    1: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Mon
    2: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Tue
    3: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Wed
    4: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Thu
    5: { completed: { type: Boolean, default: false }, syncedAt: Date }, // Fri
    6: { completed: { type: Boolean, default: false }, syncedAt: Date }  // Sat
  },

  stats: {
    timesCompleted: { type: Number, default: 0 },
    isGoalMet: { type: Boolean, default: false },
    bonusAchieved: { type: Boolean, default: false }
  }
});

// Index to prevent duplicate logs for the same week/habit
weeklyLogSchema.index({ habitId: 1, weekStartDate: 1 }, { unique: true });

export const WeeklyLog = model<IWeeklyLog>('WeeklyLog', weeklyLogSchema);