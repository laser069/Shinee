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


/**
 * Body of POST /api/habits/toggle.
 *
 * Day indexing is Mon=0 .. Sun=6 everywhere in this codebase.
 *
 * `weekStartDate` and `tzOffsetMinutes` are optional and exist for clients in a
 * timezone other than the server's: without them the week boundary and the
 * future-date guard are computed in server local time, so a device can toggle
 * into a different week than it renders. When both are absent the behaviour is
 * unchanged.
 *
 * `tzOffsetMinutes` is minutes to ADD to UTC to reach device-local time
 * (IST = +330), matching Dart's `DateTime.timeZoneOffset.inMinutes`. Note this
 * is the opposite sign to JavaScript's `Date.getTimezoneOffset()`.
 */
export const ToggleActivitySchema = z.object({
  habitId: z.string().min(1, "Habit ID is required"),
  date: z.string().optional(),
  dayIndex: z
    .number()
    .int("dayIndex must be a whole number")
    .min(0, "dayIndex must be between 0 (Monday) and 6 (Sunday)")
    .max(6, "dayIndex must be between 0 (Monday) and 6 (Sunday)")
    .optional(),
  weekStartDate: z.string().datetime({ offset: true }).optional(),
  tzOffsetMinutes: z.number().int().min(-840).max(840).optional(),
  value: z.number().optional(),
  note: z.string().max(500).optional(),
  mood: z.string().max(50).optional(),
}).refine(
  (data) => data.date !== undefined || data.dayIndex !== undefined,
  { message: "Either date or dayIndex is required", path: ["dayIndex"] }
);

export type ToggleActivityPayload = z.infer<typeof ToggleActivitySchema>;

export type Habit = z.infer<typeof HabitSchema>;
export type CreateHabitPayload = z.infer<typeof CreateHabitSchema>;