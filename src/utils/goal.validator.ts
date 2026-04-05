import z from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target_gpa: z.number().min(0).max(4),
  target_semester: z.string().min(1),
  is_achieved: z.boolean().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
