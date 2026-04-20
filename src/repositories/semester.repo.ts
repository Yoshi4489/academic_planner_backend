import prisma from "../config/prisma.js";

export const createSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
  term_no: number;
}) => {
  return await prisma.semester.create({ data });
};

export const findSemesters = async (data: { user_id: string }) => {
  return await prisma.semester.findMany({
    where: { user_id: data.user_id },
    include: { courses: true, gpas: true },
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
    include: { courses: true },
  });
};

export const updateSemester = async (data: {
  id: string;
  data: {
    year?: number;
    term?: string;
    is_complete?: boolean;
    term_no?: number;
  };
}) => {
  return await prisma.semester.update({
    where: { id: data.id },
    data: data.data,
  });
};

export const deleteSemester = async (data: { id: string }) => {
  return await prisma.semester.delete({ where: { id: data.id } });
};

export const findAllSemestersBeforeCurrentSemester = async (data: {
  user_id: string;
  year: number;
  term_no: number;
}) => {
  return await prisma.semester.findMany({
    where: {
      user_id: data.user_id,
      OR: [
        { year: { lt: data.year } },
        { year: data.year, term_no: { lt: data.term_no } },
      ],
    },
    include: { courses: true },
  });
};

export const findSemestersAfterCurrentSemester = async (
  semester_id: string,
  user_id: string,
) => {
  const currentSemester = await prisma.semester.findUnique({
    where: { id: semester_id },
  });

  if (!currentSemester) return null;

  return await prisma.semester.findMany({
    where: {
      user_id,
      OR: [
        // ปีหลังจากนี้
        { year: { gt: currentSemester.year } },
        {
          year: currentSemester.year,
          term_no: { gt: currentSemester.term_no },
        },
      ],
    },
    orderBy: [{ year: "asc" }, { term_no: "asc" }],
    include: { courses: true },
  });
};
