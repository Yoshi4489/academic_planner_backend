import z from "zod";

export const createSemesterSchema = z.object({ 
    year: z.number().int(),
    term: z.string().min(1, "Term is required"),
    term_no: z.number().int().min(1, "Term number must be at least 1"),
    is_complete: z.boolean().default(false),
})

export type createSemesterInput = z.infer<typeof createSemesterSchema>;