import { z } from "zod";

export const TaskStatusEnum = z.enum(['todo', 'inprogress', 'done']);

export const TaskSchema = z.object({
  _id: z.string().optional(), // Internal MongoDB ID
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  status: TaskStatusEnum.default('todo'),
  user: z.string(), // The ObjectId of the user
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// For creating a new task (we don't need the ID or timestamps yet)
export const CreateTaskSchema = TaskSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Types for your services
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskPayload = z.infer<typeof CreateTaskSchema>;