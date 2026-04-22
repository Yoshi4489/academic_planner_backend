import prisma from "../config/prisma";
import { gradePointMap } from "../utils/grade";
import type { CourseType, Grade, Plan } from "../generated/prisma/enums";

export const createCourse = async (data: {
  name: string;
  grade: Grade;
  credit: number;
  type: Plan;
  semester_id: string;
  category: CourseType;
}) => {
  const grade_point = gradePointMap[data.grade];
  return await prisma.course.create({
    data: {
      ...data,
      grade_point,
    },
  });
};

export const findCoursesBySemesterId = async (semester_id: string) => {
  return await prisma.course.findMany({
    where: { semester_id },
  });
};

export const findCourseById = async (data: { course_id: string }) => {
  return await prisma.course.findUnique({
    where: { id: data.course_id },
  });
};

export const updateCourse = async (
  course_id: string,
  data: Partial<{
    name: string;
    grade: Grade;
    credit: number;
    type: Plan;
    semester_id: string;
    category: CourseType;
  }>,
) => {
  const grade_point = data.grade ? gradePointMap[data.grade] : undefined;
  const updateData = {
    ...data,
    ...(grade_point !== undefined ? { grade_point } : {}),
  };

  return await prisma.course.update({
    where: { id: course_id },
    data: updateData,
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
