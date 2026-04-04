import z from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  grade: z.enum(
    ["A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"],
    "Invalid grade",
  ),
  credit: z.number().int().positive("Credit must be a positive integer"),
  type: z.enum(["ACTUAL", "PLAN"], "Invalid course type"),
  semester_id: z.string().min(1, "Semester ID is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
