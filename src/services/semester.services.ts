import createHttpError from "http-errors";
import {
  createSemester,
  deleteSemester,
  findSemesterById,
  findSemesterByYearAndTermNo,
  findSemesters,
  findSemestersAfterCurrentSemester,
  updateSemester,
} from "../repositories/semester.repo.js";
import { addGPA, calculateCumGPA } from "./gpa.services.js";

export const addSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
  term_no: number;
}) => {
  const semesterExists = await findSemesterByYearAndTermNo({
    year: data.year,
    term_no: data.term_no,
    user_id: data.user_id,
  });

  if (semesterExists) {
    throw createHttpError.Conflict("Semester already exists");
  }

  const semester = await createSemester(data);

  await addGPA({
    semester_id: semester.id,
    user_id: data.user_id,
    gpa: 0,
    cum_gpa: 0,
    total_credits: 0,
    total_grade_points: 0,
  });

  await calculateCumGPA(semester.id, data.user_id);

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

  if (!semester) {
    throw createHttpError.NotFound("Semester not found");
  }

  if (semester.user_id !== user_id) {
    throw createHttpError.Forbidden(
      "You don't have permission to access this semester",
    );
  }

  return semester;
};

export const editSemester = async (data: {
  id: string;
  user_id: string;
  data: {
    year?: number;
    term?: string;
    is_complete?: boolean;
    term_no?: number;
  };
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

  if (data.data.term_no !== undefined || data.data.year !== undefined) {
    const allSemesters = await findSemesters({ user_id: data.user_id });

    allSemesters.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.term_no - b.term_no;
    });

    if (allSemesters.length > 0) {
      const semesterId = allSemesters[0]?.id;
      if (semesterId) {
        await calculateCumGPA(semesterId, data.user_id);
      }
    }
  }

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

  const semesterAfterThis = await getSemesterAfterCurrentSemester(
    data.id,
    data.user_id,
  );
  const nextSemesterId = semesterAfterThis?.[0]?.id;

  const semester = await deleteSemester(data);

  if (nextSemesterId) {
    await calculateCumGPA(nextSemesterId, data.user_id);
  }

  return semester;
};

export const getSemesterAfterCurrentSemester = async (
  semester_id: string,
  user_id: string,
) => {
  return await findSemestersAfterCurrentSemester(semester_id, user_id);
};
