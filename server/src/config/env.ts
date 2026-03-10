import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: "PORT must be a number",
    }),
});

export const env = envSchema.parse(process.env);