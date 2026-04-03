import z from "zod";

export const createSemesterSchema = z.object({ 
    semester_year: z.number().int(),
    term: z.string().min(1, "Term is required"),
    is_complete: z.boolean().default(false),
})

export type createSemesterInput = z.infer<typeof createSemesterSchema>;