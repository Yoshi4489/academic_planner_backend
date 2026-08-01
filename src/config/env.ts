import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ACCESS_SECRET_KEY: z.string().min(32, "ACCESS_SECRET_KEY must be at least 32 characters"),
  REFRESH_SECRET_KEY: z.string().min(32, "REFRESH_SECRET_KEY must be at least 32 characters"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.string().default("0"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsed.data;
