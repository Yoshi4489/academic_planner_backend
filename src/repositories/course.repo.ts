import type { Grade, Plan } from "@prisma/client";
import prisma from "../config/prisma";
import { gradePointMap } from "../utils/grade";

export const addCourse = async (data: {
  name: string;
  grade: Grade;
  credit: number;
  type: Plan;
  semester_id: string;
}) => {
  const grade_point = gradePointMap[data.grade];
  return await prisma.course.create({
    data: {
      ...data,
      grade_point,
    },
  });
};

export const getCoursesBySemesterId = async (semester_id: string) => {
  return await prisma.course.findMany({
    where: { semester_id },
  });
};

export const editCourse = async (
  course_id: string,
  data: Partial<{
    name: string;
    grade: Grade;
    credit: number;
    type: Plan;
  }>,
) => {
  const grade_point = data.grade ? gradePointMap[data.grade] : undefined;

  return await prisma.course.update({
    where: { id: course_id },
    data: {
      ...data,
      ...(grade_point !== undefined ? { grade_point } : {}),
    },
  });
};

export const deleteCourse = async (course_id: string) => {
  return await prisma.course.delete({
    where: { id: course_id },
  });
};

export const deleteCoursesBySemesterId = async (semester_id: string) => {
  return await prisma.course.deleteMany({
    where: { semester_id },
  });
};
