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
import { recalculateUserGpas } from "./gpa.services.js";
import logger from "../config/logger.js";
import prisma from "../config/prisma.js";

export const addSemester = async (data: {
  year: number;
  term: string;
  is_complete: boolean;
  user_id: string;
  term_no: number;
}) => {
  const semester = await prisma.$transaction(async (tx) => {
    const semesterExists = await tx.semester.findFirst({
      where: {
        year: data.year,
        term_no: data.term_no,
        user_id: data.user_id,
      },
    });
    if (semesterExists) throw createHttpError.Conflict("Semester already exists");

    const created = await tx.semester.create({ data });
    await recalculateUserGpas(data.user_id, tx);
    return tx.semester.findUniqueOrThrow({
      where: { id: created.id },
      include: { courses: true, gpas: true },
    });
  });

  logger.info(
    `Semester added: ${data.year} ${data.term} for user ${data.user_id}`,
  );
  return semester;
};

export const getSemesters = async (data: { user_id: string }) => {
  const semesters = await findSemesters(data);
  logger.info(
    `Retrieved ${semesters.length} semesters for user ${data.user_id}`,
  );
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

  logger.info(`Retrieved semester ${data.id} for user ${user_id}`);
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
  const semester = await prisma.$transaction(async (tx) => {
    const existing = await tx.semester.findFirst({
      where: { id: data.id, user_id: data.user_id },
    });
    if (!existing) throw createHttpError.NotFound("Semester not found");

    const year = data.data.year ?? existing.year;
    const termNo = data.data.term_no ?? existing.term_no;
    const duplicate = await tx.semester.findFirst({
      where: {
        year,
        term_no: termNo,
        user_id: data.user_id,
        id: { not: data.id },
      },
    });
    if (duplicate) throw createHttpError.Conflict("Semester already exists");

    await tx.semester.update({ where: { id: data.id }, data: data.data });
    await recalculateUserGpas(data.user_id, tx);
    return tx.semester.findUniqueOrThrow({
      where: { id: data.id },
      include: { courses: true, gpas: true },
    });
  });

  logger.info(
    `Semester edited: ${data.id} for user ${data.user_id} with data: ${JSON.stringify(data.data)}`,
  );
  return semester;
};

export const removeSemester = async (data: { id: string; user_id: string }) => {
  const semester = await prisma.$transaction(async (tx) => {
    const existing = await tx.semester.findFirst({
      where: { id: data.id, user_id: data.user_id },
    });
    if (!existing) throw createHttpError.NotFound("Semester not found");
    const deleted = await tx.semester.delete({ where: { id: data.id } });
    await recalculateUserGpas(data.user_id, tx);
    return deleted;
  });

  logger.info(`Semester removed: ${data.id} for user ${data.user_id}`);
  return semester;
};

export const getSemesterAfterCurrentSemester = async (
  semester_id: string,
  user_id: string,
) => {
  logger.info(
    `Retrieving semesters after semester ${semester_id} for user ${user_id}`,
  );
  return await findSemestersAfterCurrentSemester(semester_id, user_id);
};
