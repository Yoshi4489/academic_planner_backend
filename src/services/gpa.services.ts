import createHttpError from "http-errors";
import {
  getSemesterAfterCurrentSemester,
  getSemesterById,
} from "./semester.services";
import {
  createGPA,
  deleteGPA,
  findGPAByUserId,
  findGPAByUserIdAndSemesterId,
  updateGPA,
} from "../repositories/gpa.repo";
import { gradePointMap } from "../utils/grade";

export const addGPA = async (data: {
  semester_id: string;
  user_id: string;
  gpa: number;
  cum_gpa: number;
  total_credits: number;
  total_grade_points: number;
}) => {
  const semester = await getSemesterById(data.user_id, {
    id: data.semester_id,
  });

  if (!semester) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await createGPA(data);
};

export const editGPA = async (
  semester_id: string,
  user_id: string,
  data: {
    gpa?: number;
    cum_gpa?: number;
    total_credits?: number;
    total_grade_points?: number;
  },
) => {
  const semester = await getSemesterById(user_id, {
    id: semester_id,
  });

  if (!semester) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await updateGPA(user_id, semester_id, data);
};

export const removeGPA = async (semester_id: string, user_id: string) => {
  const semester = await getSemesterById(user_id, { id: semester_id });

  if (!semester) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await deleteGPA(user_id, semester_id);
};

export const getGPABySemesterId = async (
  semester_id: string,
  user_id: string,
) => {
  const semester = await getSemesterById(user_id, { id: semester_id });

  if (!semester) {
    throw createHttpError.NotFound("Semester not found");
  }

  return await findGPAByUserIdAndSemesterId(user_id, semester_id);
};

export const getGPAByUserId = async (user_id: string) => {
  return await findGPAByUserId(user_id);
};

export const calculateCumGPA = async (semester_id: string, user_id: string) => {
  const currentGPA = await findGPAByUserIdAndSemesterId(user_id, semester_id);
  if (!currentGPA) return;

  let cumulativeCredits = currentGPA.total_credits;
  let cumulativeGradePoints = currentGPA.total_grade_points;

  await editGPA(semester_id, user_id, {
    cum_gpa: parseFloat((cumulativeGradePoints / cumulativeCredits).toFixed(2)),
  });

  const laterSemesters = await getSemesterAfterCurrentSemester(
    semester_id,
    user_id,
  );
  if (!laterSemesters) return;

  for (const semester of laterSemesters) {
    const gpa = await findGPAByUserIdAndSemesterId(user_id, semester.id);
    if (!gpa) continue;

    cumulativeCredits += gpa.total_credits;
    cumulativeGradePoints += gpa.total_grade_points;

    const cum_gpa =
      cumulativeCredits > 0 ? cumulativeGradePoints / cumulativeCredits : 0;

    await editGPA(semester.id, user_id, {
      cum_gpa: parseFloat(cum_gpa.toFixed(2)),
    });
  }
};

export const calculateGPA = async (semester_id: string, user_id: string) => {
  const semester = await getSemesterById(user_id, { id: semester_id });

  if (!semester.courses) {
    return;
  }

  let total_grade_points = 0;
  let total_credits = 0;
  for (const course of semester.courses) {
    total_credits += course.credit;
    total_grade_points += course.grade_point ?? gradePointMap[course.grade] * course.credit;
  }

  await editGPA(semester_id, user_id, {
    total_credits,
    total_grade_points,
    gpa: parseFloat((total_grade_points / total_credits).toFixed(2)),
  });
};
