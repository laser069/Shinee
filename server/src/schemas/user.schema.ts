import { z } from "zod";
import { env } from "../config/env";
/**
 * The Validation Schema
 * This handles the "logic" (e.g., how long a password must be)
 */
export const UserRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .lowercase(),
  
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  
  isAdmin: z
    .boolean()
    .default(false)
    .optional(),
});

/**
 * The TypeScript Type
 * This is what you import in your Service/Controller
 * export type UserRegistration = { name: string; email: string; ... }
 */
export const UserLoginSchema = UserRegistrationSchema.pick({
  email: true,
  password: true,
});
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;