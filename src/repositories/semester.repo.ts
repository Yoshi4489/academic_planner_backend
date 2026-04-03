import prisma from "../config/prisma.js";

export const createSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
}) => {
  return await prisma.semester.create({ data });
};

export const findSemesters = async (data: { user_id: string }) => {
  return await prisma.semester.findMany({
    where: { user_id: data.user_id },
    include: { courses: true },
  });
};

export const findSemesterByYearAndTerm = async (data: {
  year: number;
  term: string;
  user_id: string;
}) => {
  return await prisma.semester.findFirst({
    where: {
      year: data.year,
      term: data.term ?? undefined,
      user_id: data.user_id,
    },
  });
};

export const findSemesterById = async (data: { id: string }) => {
  return await prisma.semester.findUnique({
    where: { id: data.id },
  });
};

export const updateSemester = async (data: {
  id: string;
  data: { year?: number; term?: string; is_complete?: boolean };
}) => {
  return await prisma.semester.update({
    where: { id: data.id },
    data: data.data,
  });
};

export const deleteSemester = async (data: { id: string }) => {
  return await prisma.semester.delete({ where: { id: data.id } });
};
