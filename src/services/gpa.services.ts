import createHttpError from "http-errors";
import { getSemesterById } from "./semester.services";
import {
  createGPA,
  deleteGPA,
  findGPAByUserId,
  findGPAByUserIdAndSemesterId,
  updateGPA,
} from "../repositories/gpa.repo";

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
