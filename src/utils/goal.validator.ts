import z from "zod";

export const createGoalSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  target_gpa: z.number().min(0).max(4),
  target_semester_id: z.uuid("Invalid Semester ID"),
  is_achieved: z.boolean().optional(),
});

export const updateGoalSchema = createGoalSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one goal field is required",
  });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
