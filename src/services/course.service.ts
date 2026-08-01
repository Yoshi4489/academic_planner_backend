import createHttpError from "http-errors";
import type { CourseType, Grade, Plan } from "../generated/prisma/enums.js";
import prisma from "../config/prisma.js";
import logger from "../config/logger.js";
import { gradePointMap } from "../utils/grade.js";
import { recalculateUserGpas } from "./gpa.services.js";

type CourseInput = {
  name: string;
  grade: Grade;
  credit: number;
  type: Plan;
  semester_id: string;
  category: CourseType;
  course_code?: string | null;
  instructor?: string | null;
  notes?: string | null;
};

export const addCourse = async (userId: string, data: CourseInput) => {
  const course = await prisma.$transaction(async (tx) => {
    const semester = await tx.semester.findFirst({
      where: { id: data.semester_id, user_id: userId },
    });
    if (!semester) throw createHttpError.NotFound("Semester not found");

    const created = await tx.course.create({
      data: { ...data, grade_point: gradePointMap[data.grade] },
    });
    await recalculateUserGpas(userId, tx);
    return created;
  });
  logger.info(`Course added: ${data.name} for user ${userId}`);
  return course;
};

export const editCourse = async (
  courseId: string,
  userId: string,
  data: Partial<CourseInput>,
) => {
  const updated = await prisma.$transaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: { id: courseId, semester: { user_id: userId } },
    });
    if (!course) throw createHttpError.NotFound("Course not found");

    if (data.semester_id) {
      const target = await tx.semester.findFirst({
        where: { id: data.semester_id, user_id: userId },
      });
      if (!target) throw createHttpError.NotFound("Semester not found");
    }

    const result = await tx.course.update({
      where: { id: courseId },
      data: {
        ...data,
        ...(data.grade ? { grade_point: gradePointMap[data.grade] } : {}),
      },
    });
    await recalculateUserGpas(userId, tx);
    return result;
  });
  logger.info(`Course updated: ${updated.name} for user ${userId}`);
  return updated;
};

export const getCourseById = async (
  userId: string,
  data: { course_id: string },
) => {
  const course = await prisma.course.findFirst({
    where: { id: data.course_id, semester: { user_id: userId } },
  });
  if (!course) throw createHttpError.NotFound("Course not found");
  return course;
};

export const getCoursesBySemesterId = async (
  userId: string,
  data: { semester_id: string },
) => {
  const semester = await prisma.semester.findFirst({
    where: { id: data.semester_id, user_id: userId },
  });
  if (!semester) throw createHttpError.NotFound("Semester not found");
  return prisma.course.findMany({ where: { semester_id: data.semester_id } });
};

export const removeCourse = async (
  userId: string,
  data: { course_id: string },
) => prisma.$transaction(async (tx) => {
  const course = await tx.course.findFirst({
    where: { id: data.course_id, semester: { user_id: userId } },
  });
  if (!course) throw createHttpError.NotFound("Course not found");
  const deleted = await tx.course.delete({ where: { id: data.course_id } });
  await recalculateUserGpas(userId, tx);
  return deleted;
});

export const removeCourseBySemesterId = async (
  userId: string,
  data: { semester_id: string },
) => prisma.$transaction(async (tx) => {
  const semester = await tx.semester.findFirst({
    where: { id: data.semester_id, user_id: userId },
  });
  if (!semester) throw createHttpError.NotFound("Semester not found");
  const deleted = await tx.course.deleteMany({
    where: { semester_id: data.semester_id },
  });
  await recalculateUserGpas(userId, tx);
  return deleted;
});
