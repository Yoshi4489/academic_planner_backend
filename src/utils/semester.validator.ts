import z from "zod";

const semesterFields = {
  year: z.number().int().min(1900).max(2200),
  term: z.string().trim().min(1, "Term is required").max(50),
  term_no: z.number().int().min(1).max(12),
  is_complete: z.boolean(),
};

export const createSemesterSchema = z.object({
  ...semesterFields,
  is_complete: semesterFields.is_complete.default(false),
});

export const updateSemesterSchema = z
  .object({
    year: semesterFields.year.optional(),
    term: semesterFields.term.optional(),
    term_no: semesterFields.term_no.optional(),
    is_complete: semesterFields.is_complete.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one semester field is required",
  });

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
