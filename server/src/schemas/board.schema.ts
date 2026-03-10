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

// Types for your services
export type Board = z.infer<typeof BoardSchema>;
export type CreateBoardPayload = z.infer<typeof CreateBoardSchema>;