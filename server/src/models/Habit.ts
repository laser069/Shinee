import { Schema, model, Document, Types } from 'mongoose';

export interface IHabit extends Document {
  user: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  
  // Logic Config
  frequencyType: 'fixed' | 'flexible';
  fixedDays: number[]; // [0-6] where 0 is Sunday, 1 is Monday...
  goalCount: number;   // e.g., 3 if they want to do it 3x a week
  
  // Gamification & Streaks
  dailyStreak: number;
  weeklyStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date; // To verify if daily streak is still valid
  
  // Consistency Multiplier
  multiplier: number;
  totalPoints: number;
  
  isActive: boolean;
  createdAt: Date;
}

const habitSchema = new Schema<IHabit>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '✅' },
  color: { type: String, default: '#3B82F6' }, // Tailwind blue-500

  frequencyType: { 
    type: String, 
    enum: ['fixed', 'flexible'], 
    default: 'flexible' 
  },
  fixedDays: [{ type: Number, min: 0, max: 6 }],
  goalCount: { type: Number, default: 1 },

  dailyStreak: { type: Number, default: 0 },
  weeklyStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date },

  multiplier: { type: Number, default: 1.0 },
  totalPoints: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Habit = model<IHabit>('Habit', habitSchema);