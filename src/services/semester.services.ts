import {
  createSemester,
  deleteSemester,
  findSemesters,
  updateSemester,
} from "../repositories/semester.repo.js";

export const addSemester = async (data: {
  semester_year: number;
  term: string;
  is_completed: boolean;
  user_id: string;
}) => {
  const semester = await createSemester(data);
  return semester;
};

export const getSemesters = async (data: { user_id: string }) => {
  const semesters = await findSemesters(data);
  return semesters;
};

export const editSemester = async (data: {
  id: string;
  data: { semester_year?: number; term?: string; is_complete?: boolean };
}) => {
  const semester = await updateSemester(data);
  return semester;
};

export const removeSemester = async (data: { id: string }) => {
  const semester = await deleteSemester(data);
};
