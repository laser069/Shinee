import { z } from "zod";

export const HabitSchema = z.object({
  _id: z.string().optional(),
  user: z.string(),
  name: z.string().min(1, "Habit name is required").max(100),
  color: z.string().default("#3B82F6"),

  // Frequency Logic
  frequencyType: z.enum(["fixed", "flexible"]),
  fixedDays: z.array(z.number().min(0).max(6)).default([]),
  goalCount: z.number().min(1).max(7).default(1),

  // Gamification (Usually managed by backend, but defined here for type safety)
  dailyStreak: z.number().default(0),
  weeklyStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  lastCompletedDate: z.date().optional().nullable(),
  
  multiplier: z.number().default(1.0),
  totalPoints: z.number().default(0),

  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// For creating a habit (Input from user)
export const CreateHabitSchema = HabitSchema.omit({
  _id: true,
  user: true,
  dailyStreak: true,
  weeklyStreak: true,
  longestStreak: true,
  lastCompletedDate: true,
  multiplier: true,
  totalPoints: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

// For updating habit settings
export const UpdateHabitSchema = HabitSchema.pick({
  name: true,
  color: true,
  frequencyType: true,
  fixedDays: true,
  goalCount: true,
  isActive: true,
}).partial();


export type Habit = z.infer<typeof HabitSchema>;
export type CreateHabitPayload = z.infer<typeof CreateHabitSchema>;