import { z } from "zod";

const DayEntrySchema = z.object({
  completed: z.boolean().default(false),
  syncedAt: z.date().optional(),
});

export const WeeklyLogSchema = z.object({
  _id: z.string().optional(),
  habitId: z.string(),
  weekStartDate: z.date(),
  
  // Record of 7 days (0-6)
  days: z.record(z.string(), DayEntrySchema),

  stats: z.object({
    timesCompleted: z.number().default(0),
    isGoalMet: z.boolean().default(false),
    bonusAchieved: z.boolean().default(false),
  }),
});

// Schema for toggling a checkbox (What the frontend sends)
export const ToggleHabitDaySchema = z.object({
  params: z.object({
    logId: z.string(),
  }),
  body: z.object({
    dayIndex: z.number().min(0).max(6),
    completed: z.boolean(),
  }),
});

export type WeeklyLog = z.infer<typeof WeeklyLogSchema>;
export type ToggleHabitDayPayload = z.infer<typeof ToggleHabitDaySchema>;