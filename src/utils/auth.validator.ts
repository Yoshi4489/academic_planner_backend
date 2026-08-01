import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be between 8 and 32 characters long")
  .max(32, "Password must be between 8 and 32 characters long");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long"),
  email: z.string().trim().email("Invalid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1).max(72),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  purpose: z.literal("reset_password"),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Invalid password-reset token"),
  newPassword: passwordSchema,
});

export const logoutSchema = z.object({
  refresh_token: z.string().min(32).max(200),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const changePasswordSchema = z.object({
  current_password: z.string().min(1).max(72),
  new_password: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
