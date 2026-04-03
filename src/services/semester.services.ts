import createHttpError from "http-errors";
import {
  createSemester,
  deleteSemester,
  findSemesterById,
  findSemesters,
  updateSemester,
} from "../repositories/semester.repo.js";

export const addSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
}) => {
  const semester = await createSemester(data);
  return semester;
};

export const getSemesters = async (data: { user_id: string }) => {
  const semesters = await findSemesters(data);
  return semesters;
};

export const getSemesterById = async (
  user_id: string,
  data: {
    id: string;
  },
) => {
  const semester = await findSemesterById(data);

  if (semester?.user_id !== user_id) {
    throw createHttpError.Forbidden(
      "You don't have permission to access this semester",
    );
  }

  return semester;
};

export const editSemester = async (data: {
  id: string;
  user_id: string;
  data: { year?: number; term?: string; is_complete?: boolean };
}) => {
  const isExisted = await findSemesterById({ id: data.id });

  // Check existence
  if (!isExisted) {
    throw createHttpError.NotFound("Semester not found");
  }

  // Check ownership
  if (isExisted.user_id !== data.user_id) {
    throw createHttpError.Forbidden(
      "You don't have permission to edit this semester",
    );
  }

  const semester = await updateSemester(data);
  return semester;
};

export const removeSemester = async (data: { id: string; user_id: string }) => {
  const isExisted = await findSemesterById({ id: data.id });

  // Check existence
  if (!isExisted) {
    throw createHttpError.NotFound("Semester not found");
  }

  // Check ownership
  if (isExisted.user_id !== data.user_id) {
    throw createHttpError.Forbidden(
      "You don't have permission to delete this semester",
    );
  }

  const semester = await deleteSemester(data);
  return semester;
};
