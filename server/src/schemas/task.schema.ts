import { z } from "zod";

export const TaskStatusEnum = z.enum(['todo', 'inprogress', 'done']);

export const TaskSchema = z.object({
  _id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .default(""),
  status: TaskStatusEnum.default('todo'),
  user: z.string(),
  boardId: z.string().optional(),
  
  // 1. THE "HARD" DEADLINE
  dueDate: z.string().datetime().optional().nullable(),

  // 2. THE TOTAL ACCUMULATED TIME (ms)
  totalTimeSpent: z.number().default(0),

  // 3. THE "PLAY" TIMESTAMP (ISO string)
  activeStartTime: z.string().datetime().optional().nullable(),

  // 4. THE GOAL / DURATION (ms)
  targetDuration: z.number().optional().nullable(), 

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// For creating a new task - exclude sensitive time fields that server manages
export const CreateTaskSchema = TaskSchema.omit({ 
  _id: true, 
  user: true, // Server sets this from req.user
  totalTimeSpent: true, 
  activeStartTime: true,
  createdAt: true, 
  updatedAt: true 
});

// For updating a task (allows partial updates)
export const UpdateTaskPayloadSchema = CreateTaskSchema.partial();

// Types for your services
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskPayload = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof UpdateTaskPayloadSchema>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;