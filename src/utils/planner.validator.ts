import { z } from "zod";

export const meetingSchema = z.object({
  weekday: z.number().int().min(1).max(7),
  start_minute: z.number().int().min(0).max(1439),
  end_minute: z.number().int().min(1).max(1440),
  location: z.string().trim().max(200).nullable().optional(),
}).refine((value) => value.end_minute > value.start_minute, {
  message: "End time must be after start time",
});

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(["ASSIGNMENT", "EXAM", "QUIZ", "PROJECT", "OTHER"]),
  due_at: z.iso.datetime(),
  notes: z.string().trim().max(2000).nullable().optional(),
  is_complete: z.boolean().optional(),
  reminder_offset_minutes: z.number().int().min(0).max(43_200).nullable().optional(),
});

export const updateTaskSchema = taskSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one task field is required",
);

export const requirementSchema = z.object({
  name: z.string().trim().min(1).max(100),
  required_credits: z.number().int().min(1).max(999),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
});

export const updateRequirementSchema = requirementSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one requirement field is required",
);

export const prerequisiteSchema = z.object({
  prerequisite_id: z.uuid(),
});

export const assignRequirementSchema = z.object({
  requirement_id: z.uuid().nullable(),
});
