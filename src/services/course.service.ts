import type { Grade, Plan } from "@prisma/client";
import { getSemesterById } from "./semester.services";
import {
  createCourse,
  deleteCourse,
  deleteCoursesBySemesterId,
  findCourseById,
  findCoursesBySemesterId,
  updateCourse,
} from "../repositories/course.repo";
import createHttpError from "http-errors";
import type { CourseType } from "../generated/prisma/enums";
import { findGPAByUserIdAndSemesterId } from "../repositories/gpa.repo";
import { editGPA } from "./gpa.services";
import { gradePointMap } from "../utils/grade";

export const addCourse = async (
  user_id: string,
  data: {
    name: string;
    grade: Grade;
    credit: number;
    type: Plan;
    semester_id: string;
    category: CourseType;
  },
) => {
  const semester = await getSemesterById(user_id, { id: data.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Semester not found");
  }

  const GPA = await findGPAByUserIdAndSemesterId(user_id, data.semester_id);

  if (!GPA) {
    throw createHttpError.InternalServerError(
      "GPA record not found for the semester. Please contact support.",
    );
  }

  await editGPA(data.semester_id, user_id, {
    total_credits: GPA.total_credits + data.credit,
    total_grade_points: GPA.total_grade_points + data.credit * gradePointMap[data.grade],
    gpa: (GPA.total_grade_points + data.credit * gradePointMap[data.grade]) / (GPA.total_credits + data.credit),
  });

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
    category: CourseType;
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

export const getCourseById = async (
  user_id: string,
  data: { course_id: string },
) => {
  const course = await findCourseById(data);

  if (!course) {
    throw createHttpError.NotFound("Course not found");
  }

  const semester = await getSemesterById(user_id, { id: course.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Course not found");
  }

  return course;
};

export const getCoursesBySemesterId = async (
  user_id: string,
  data: { semester_id: string },
) => {
  const semester = await getSemesterById(user_id, { id: data.semester_id });

  if (!semester || semester.user_id !== user_id) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await findCoursesBySemesterId(data.semester_id);
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
