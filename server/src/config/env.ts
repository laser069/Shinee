// config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is missing from .env"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string(),
  // Comma-separated allowlist. The default keeps the Vite dev server (port
  // 3000, see client/vite.config.ts) working with no .env change.
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
});

// This will throw a clear error immediately when the server starts
// if a variable is missing, instead of crashing later.
export const env: z.infer<typeof envSchema> = envSchema.parse(process.env);

export const corsOrigins: string[] = env.CORS_ORIGINS
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
