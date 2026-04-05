import createHttpError from "http-errors";
import {
  createGoal,
  deleteGoal,
  findGoalById,
  findGoalByUserId,
  updateGoal,
} from "../repositories/goal.repo";

export const addGoal = async (data: {
  user_id: string;
  name?: string;
  target_gpa: number;
  target_semester: string;
  is_achieved?: boolean;
}) => {
  return await createGoal(data);
};

export const editGoal = async (
  user_id: string,
  goal_id: string,
  data: Partial<{
    name?: string;
    target_gpa?: number;
    target_semester?: string;
    is_achieved?: boolean;
  }>,
) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  return await updateGoal(goal_id, data);
};

export const removeGoal = async (user_id: string, goal_id: string) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  return await deleteGoal(goal_id);
};

export const getGoalByUserId = async (user_id: string) => {
  const goals = await findGoalByUserId(user_id);

  if (!goals || goals.length === 0) {
    throw createHttpError.NotFound("No goals found");
  }

  return goals;
};

export const getGoalById = async (user_id: string, goal_id: string) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  return goal;
};
