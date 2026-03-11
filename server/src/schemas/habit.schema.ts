import { z } from "zod";

export const HabitValidationSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  category: z.enum(['Health', 'Growth', 'Quit', 'Social', 'Finance', 'Mind']),
  ui: z.object({
    icon: z.string().default('🎯'),
    color: z.string().default('indigo')
  }),
  goal: z.object({
    type: z.enum(['boolean', 'numeric']),
    targetValue: z.number().min(1),
    unit: z.string(),
    frequency: z.enum(['daily', 'weekly']),
    scheduledDays: z.array(z.number()).max(7),
    weeklyTarget: z.number().max(7).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard'])
  }),
  reminders: z.object({
    enabled: z.boolean().default(false),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional()
  }).optional()
});