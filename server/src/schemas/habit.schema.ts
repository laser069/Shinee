import { z } from "zod";

export const HabitValidationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(['Health', 'Growth', 'Quit', 'Social']),
  goal: z.object({
    targetValue: z.number().min(1).default(1),
    unit: z.string().default('times'),
    frequency: z.enum(['daily', 'weekly']).default('daily'),
    scheduledDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
  }),
  gamification: z.object({
    basePoints: z.number().default(10),
  }).optional(),
});

// For partial updates (Editing)
export const HabitUpdateSchema = HabitValidationSchema.partial();

export const ToggleValidationSchema = z.object({
  habitId: z.string(),
  date: z.string(), // ISO String from frontend
});

export type HabitInput = z.infer<typeof HabitValidationSchema>;