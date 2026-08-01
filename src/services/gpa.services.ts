import createHttpError from "http-errors";
import prisma from "../config/prisma.js";
import logger from "../config/logger.js";
import { calculateSemesterMetrics } from "../utils/gpa-calculator.js";

type GpaDb = Pick<typeof prisma, "semester" | "gPA">;

const rounded = (value: number) => Number(value.toFixed(2));

export const recalculateUserGpas = async (userId: string, db: GpaDb = prisma) => {
  const semesters = await db.semester.findMany({
    where: { user_id: userId },
    orderBy: [{ year: "asc" }, { term_no: "asc" }],
    include: { courses: true },
  });

  let cumulativeCredits = 0;
  let cumulativeGradePoints = 0;

  for (const semester of semesters) {
    const metrics = calculateSemesterMetrics(semester.courses);

    cumulativeCredits += metrics.actualCredits;
    cumulativeGradePoints += metrics.actualPoints;

    await db.gPA.upsert({
      where: {
        user_id_semester_id: { user_id: userId, semester_id: semester.id },
      },
      create: {
        user_id: userId,
        semester_id: semester.id,
        gpa: metrics.actualGpa,
        cum_gpa: cumulativeCredits
          ? rounded(cumulativeGradePoints / cumulativeCredits)
          : 0,
        total_credits: metrics.actualCredits,
        total_grade_points: metrics.actualPoints,
        projected_gpa: metrics.projectedGpa,
        projected_total_credits: metrics.projectedCredits,
        projected_total_grade_points: metrics.projectedPoints,
      },
      update: {
        gpa: metrics.actualGpa,
        cum_gpa: cumulativeCredits
          ? rounded(cumulativeGradePoints / cumulativeCredits)
          : 0,
        total_credits: metrics.actualCredits,
        total_grade_points: metrics.actualPoints,
        projected_gpa: metrics.projectedGpa,
        projected_total_credits: metrics.projectedCredits,
        projected_total_grade_points: metrics.projectedPoints,
        calculated_at: new Date(),
      },
    });
  }
};

const withAliases = <T extends {
  gpa: number;
  total_credits: number;
  total_grade_points: number;
}>(record: T) => ({
  ...record,
  actual_gpa: record.gpa,
  actual_credits: record.total_credits,
  actual_grade_points: record.total_grade_points,
});

export const getGPABySemesterId = async (
  semesterId: string,
  userId: string,
) => {
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, user_id: userId },
  });
  if (!semester) throw createHttpError.NotFound("Semester not found");

  const gpa = await prisma.gPA.findUnique({
    where: { user_id_semester_id: { user_id: userId, semester_id: semesterId } },
  });
  logger.info(`Retrieved GPA for semester ${semesterId} for user ${userId}`);
  return gpa ? withAliases(gpa) : null;
};

export const getGPAByUserId = async (userId: string) => {
  const gpas = await prisma.gPA.findMany({ where: { user_id: userId } });
  logger.info(`Retrieved all GPAs for user ${userId}`);
  return gpas.map(withAliases);
};

// Backward-compatible entry points used by existing services.
export const calculateGPA = async (_semesterId: string, userId: string) => {
  await prisma.$transaction((tx) => recalculateUserGpas(userId, tx));
};

export const calculateCumGPA = calculateGPA;

export const addGPA = async (data: {
  semester_id: string;
  user_id: string;
  gpa: number;
  cum_gpa: number;
  total_credits: number;
  total_grade_points: number;
}) => prisma.gPA.create({ data });
