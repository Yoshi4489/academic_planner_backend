import prisma from "../config/prisma";

export const createGoal = async (data: {
  user_id: string;
  name?: string;
  target_gpa: number;
  target_semester: string;
}) => {
  return await prisma.goal.create({ data });
};

export const updateGoal = async (
  id: string,
  data: Partial<{
    name: string;
    target_gpa: number;
    target_semester: string;
  }>,
) => {
  return await prisma.goal.update({ where: { id }, data });
};

export const findGoalByUserId = async (user_id: string) => {
  return await prisma.goal.findMany({ where: { user_id } });
};

export const findGoalById = async (id: string) => {
  return await prisma.goal.findUnique({ where: { id } });
};

export const deleteGoal = async (id: string) => {
  return await prisma.goal.delete({ where: { id } });
};
