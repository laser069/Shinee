// config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is missing from .env"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string(),
});

// This will throw a clear error immediately when the server starts 
// if a variable is missing, instead of crashing later.
export const env: z.infer<typeof envSchema> = envSchema.parse(process.env);