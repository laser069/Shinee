import { z } from "zod";
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

  // isAdmin is deliberately NOT accepted here - it was client-settable, which
  // let anyone self-register as an admin. The Mongoose default (false) governs.
});

/**
 * The TypeScript Type
 * This is what you import in your Service/Controller
 * export type UserRegistration = { name: string; email: string; ... }
 */
export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;