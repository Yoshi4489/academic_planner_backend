import prisma from "../config/prisma";

export const createGPA = async (data: {
  semester_id: string;
  user_id: string;
  gpa: number;
  cum_gpa: number;
  total_credits: number;
  total_grade_points: number;
}) => {
  return await prisma.gPA.create({ data });
};

export const updateGPA = async (
  user_id: string,
  semester_id: string,
  data: Partial<{
    gpa: number;
    cum_gpa: number;
    total_credits: number;
    total_grade_points: number;
  }>,
) => {
  return await prisma.gPA.update({
    where: { user_id_semester_id: { user_id, semester_id } },
    data,
  });
};

export const deleteGPA = async (user_id: string, semester_id: string) => {
  return await prisma.gPA.delete({
    where: { user_id_semester_id: { user_id, semester_id } },
  });
};

export const findGPAByUserId = async (user_id: string) => {
  return await prisma.gPA.findMany({
    where: { user_id },
  });
};

export const findGPAByUserIdAndSemesterId = async (
  user_id: string,
  semester_id: string,
) => {
  return await prisma.gPA.findUnique({
    where: { user_id_semester_id: { user_id, semester_id } },
  });
};
