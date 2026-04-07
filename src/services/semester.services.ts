import createHttpError from "http-errors";
import {
  createSemester,
  deleteSemester,
  findSemesterById,
  findSemesters,
  findSemestersAfterCurrentSemester,
  updateSemester,
} from "../repositories/semester.repo.js";
import { addGPA, calculateCumGPA, removeGPA } from "./gpa.services.js";
import { removeCourseBySemesterId } from "./course.service.js";

export const addSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
  term_no: number;
}) => {
  const semester = await createSemester(data);

  await addGPA({
    semester_id: semester.id,
    user_id: data.user_id,
    gpa: 0,
    cum_gpa: 0,
    total_credits: 0,
    total_grade_points: 0,
  });

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
    await calculateCumGPA(data.id, data.user_id);
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

  if (
    semesterAfterThis?.length !== 0 &&
    semesterAfterThis !== null &&
    semesterAfterThis[0]?.id !== undefined
  ) {
    await calculateCumGPA(semesterAfterThis[0]?.id, data.user_id);
  }

  const semester = await deleteSemester(data);

  return semester;
};

export const getSemesterAfterCurrentSemester = async (
  semester_id: string,
  user_id: string,
) => {
  return await findSemestersAfterCurrentSemester(semester_id, user_id);
};
