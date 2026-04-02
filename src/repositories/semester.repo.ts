import prisma from "../config/prisma.js";

export const createSemester = async (data: {
  semester_year: number;
  term: string;
  is_completed: boolean;
  user_id: string;
}) => {
  return await prisma.semester.create({
    data,
  });
};

export const findSemesters = async (data: { user_id: string }) => {
  return await prisma.semester.findMany({
    where: { user_id: data.user_id },
    include: { courses: true },
  });
};

export const findSemesterByYearAndTerm = async (data: {
  semester_year: number;
  term: string;
  user_id: string;
}) => {
  return await prisma.semester.findFirst({
    where: {
      semester_year: data.semester_year,
      term: data.term ?? undefined,
      user_id: data.user_id,
    },
  });
};

export const updateSemester = async (data: {
  id: string;
  data: { semester_year?: number; term?: string; is_complete?: boolean };
}) => {
  return await prisma.semester.update({
    where: { id: data.id },
    data: data.data,
  });
};

export const deleteSemester = async (data: { id: string }) => {
  return await prisma.semester.delete({ where: { id: data.id } });
};
