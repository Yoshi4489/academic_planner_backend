import { z } from "zod";
import { createCourseSchema } from "./course.validator.js";

const guestCourse = createCourseSchema.omit({ semester_id: true }).extend({
  id: z.string().min(1).max(100),
});

const guestSemester = z.object({
  id: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2200),
  term: z.string().trim().min(1).max(100),
  term_no: z.number().int().min(1).max(10),
  is_complete: z.boolean(),
  courses: z.array(guestCourse).max(100),
});

const guestGoal = z.object({
  name: z.string().trim().min(1).max(200),
  target_gpa: z.number().min(0).max(4),
  is_achieved: z.boolean(),
  target_semester_id: z.string().min(1).max(100),
});

export const guestSnapshotSchema = z.object({
  schema_version: z.literal(1),
  semesters: z.array(guestSemester).max(50),
  goals: z.array(guestGoal).max(100).default([]),
});

export const guestCommitSchema = z.object({
  snapshot: guestSnapshotSchema,
  merge_token: z.string().min(20).max(300),
  decisions: z.array(z.object({
    semester_id: z.string().min(1).max(100),
    action: z.enum(["KEEP_CLOUD", "REPLACE_CLOUD", "MERGE_COURSES"]),
  })).max(50),
});

export type GuestSnapshot = z.infer<typeof guestSnapshotSchema>;
