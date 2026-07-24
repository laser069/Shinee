import { z } from "zod";

const TagSchema = z.object({
  name: z.string(),
  color: z.string(),
});

const SubtaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  completed: z.boolean().default(false),
});

const DayEntrySchema = z.object({
  completed: z.boolean().default(false),
  syncedAt: z.coerce.date().optional(),
});

export const ExportedBoardSchema = z.object({
  _id: z.string(),
  title: z.string(),
  tasks: z.array(z.string()).default([]),
});

export const ExportedTaskSchema = z.object({
  _id: z.string(),
  boardId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'inprogress', 'done']).default('todo'),
  dueDate: z.coerce.date().optional().nullable(),
  totalTimeSpent: z.number().default(0),
  activeStartTime: z.coerce.date().optional().nullable(),
  targetDuration: z.number().optional().nullable(),
  tags: z.array(TagSchema).default([]),
  subtasks: z.array(SubtaskSchema).default([]),
});

export const ExportedHabitSchema = z.object({
  _id: z.string(),
  name: z.string(),
  color: z.string().default('#3B82F6'),
  frequencyType: z.enum(['fixed', 'flexible']).default('flexible'),
  fixedDays: z.array(z.number()).default([]),
  goalCount: z.number().default(1),
  dailyStreak: z.number().default(0),
  weeklyStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  lastCompletedDate: z.coerce.date().optional().nullable(),
  multiplier: z.number().default(1),
  totalPoints: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const ExportedWeeklyLogSchema = z.object({
  _id: z.string().optional(),
  habitId: z.string(),
  weekStartDate: z.coerce.date(),
  days: z.record(z.string(), DayEntrySchema),
  stats: z.object({
    timesCompleted: z.number().default(0),
    isGoalMet: z.boolean().default(false),
    bonusAchieved: z.boolean().default(false),
  }),
});

export const ImportSchema = z.object({
  version: z.number(),
  exportedAt: z.string().optional(),
  mode: z.enum(['merge', 'replace']),
  boards: z.array(ExportedBoardSchema).default([]),
  tasks: z.array(ExportedTaskSchema).default([]),
  habits: z.array(ExportedHabitSchema).default([]),
  weeklyLogs: z.array(ExportedWeeklyLogSchema).default([]),
});

export type ImportPayload = z.infer<typeof ImportSchema>;
