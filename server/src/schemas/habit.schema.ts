import { z } from "zod";

// --- 1. HABIT VALIDATION ---
export const HabitValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  category: z.enum(['Health', 'Growth', 'Quit', 'Social', 'Milestone']),
  trackingType: z.enum(['numeric', 'binary', 'countdown']),
  
  goal: z.object({
    targetValue: z.number().positive("Target must be greater than 0").default(1),
    unit: z.string().optional(),
    frequency: z.enum(['daily', 'weekly']).default('daily'),
  }),

  gamification: z.object({
    basePoints: z.number().min(0).default(10),
    // We usually don't let the user "set" their own streak via API for security
  }).optional(),
});

// --- 2. LOG VALIDATION ---
export const LogValidationSchema = z.object({
  habitId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Habit ID format"), // Validates MongoDB ObjectId
  value: z.number().min(0, "Value cannot be negative"),
  date: z.string().datetime().optional(), // ISO string date
  note: z.string().max(200).optional(),
});

// --- 3. TYPES (Optional but helpful if using TypeScript) ---
export type HabitInput = z.infer<typeof HabitValidationSchema>;
export type LogInput = z.infer<typeof LogValidationSchema>;