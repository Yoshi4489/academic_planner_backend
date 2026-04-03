import type { Grade, Plan } from "@prisma/client";
import { getSemesterById } from "./semester.services";
import {
  createCourse,
  deleteCourse,
  deleteCoursesBySemesterId,
  findCourseById,
  updateCourse,
} from "../repositories/course.repo";
import createHttpError from "http-errors";

export const addCourse = async (
  user_id: string,
  data: {
    name: string;
    grade: Grade;
    credit: number;
    type: Plan;
    semester_id: string;
  },
) => {
  const semester = await getSemesterById(user_id, { id: data.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await createCourse({
    ...data,
  });
};

export const editCourse = async (
  course_id: string,
  user_id: string,
  data: Partial<{
    name: string;
    grade: Grade;
    credit: number;
    type: Plan;
    semester_id: string;
  }>,
) => {
  const course = await findCourseById({ course_id });
  if (!course) throw createHttpError.NotFound("Course not found");

  const semester = await getSemesterById(user_id, { id: course.semester_id });
  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.Forbidden("You don't have permission");
  }

  if (data.semester_id) {
    const newSemester = await getSemesterById(user_id, {
      id: data.semester_id,
    });
    if (!newSemester || newSemester.user_id !== user_id) {
      throw createHttpError.NotFound("Semester not found");
    }
  }

  return await updateCourse(course_id, data);
};

export const removeCourse = async (
  user_id: string,
  data: { course_id: string },
) => {
  const course = await findCourseById(data);

  if (!course) {
    throw createHttpError.NotFound("Course not found");
  }

  const semester = await getSemesterById(user_id, { id: course.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Semester Not Found");
  }

  return await deleteCourse(data.course_id);
};

export const removeCourseBySemesterId = async (
  user_id: string,
  data: { semester_id: string },
) => {
  const semester = await getSemesterById(user_id, { id: data.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await deleteCoursesBySemesterId(semester.id);
};
