import { z } from "zod";

export const BoardSchema = z.object({
  _id: z.string().optional(),
  title: z
    .string()
    .min(1, "Board title is required")
    .max(50, "Board title is too long"),
  tasks: z
    .array(z.string()) // Array of Task ObjectIds
    .default([]),
  user: z.string(), // The owner of the board
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// For creating a new board
export const CreateBoardSchema = BoardSchema.omit({ 
  _id: true, 
  tasks: true, // Usually starts empty
  createdAt: true, 
  updatedAt: true 
});

export const UpdateBoardSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required") // Acts as the 'required' check
      .min(3, "Title must be at least 3 characters")
      .max(50, "Title cannot exceed 50 characters")
      .trim(),
  }),
});

// Types for your services
export type Board = z.infer<typeof BoardSchema>;
export type CreateBoardPayload = z.infer<typeof CreateBoardSchema>;
export type UpdateBoardSchema = z.infer<typeof UpdateBoardSchema>;