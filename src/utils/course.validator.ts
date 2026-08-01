import z from "zod";

export const createCourseSchema = z.object({
  name: z.string().trim().min(1, "Course name is required").max(200),
  grade: z.enum(
    ["A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"],
    "Invalid grade",
  ),
  credit: z.number().int().min(1).max(30),
  type: z.enum(["ACTUAL", "PLAN"], "Invalid course type"),
  semester_id: z.uuid("Invalid Semester ID"),
  category: z.enum(
    ["GEN_ED", "MAJOR_REQUIRED", "MAJOR_ELECTIVE", "MINOR", "FREE_ELECTIVE"],
    "Invalid course category",
  ),
  course_code: z.string().trim().max(30).nullable().optional(),
  instructor: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one course field is required",
  });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
