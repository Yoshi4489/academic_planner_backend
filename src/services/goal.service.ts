import createHttpError from "http-errors";
import {
  createGoal,
  deleteGoal,
  findGoalById,
  findGoalByUserId,
  updateGoal,
} from "../repositories/goal.repo";
import logger from "../config/logger";
import { log } from "node:console";

export const addGoal = async (data: {
  user_id: string;
  name?: string;
  target_gpa: number;
  target_semester_id: string;
  is_achieved?: boolean;
}) => {
  logger.info(`Adding goal for user ${data.user_id} with target GPA ${data.target_gpa} for semester ${data.target_semester_id}`);
  return await createGoal(data);
};

export const editGoal = async (
  user_id: string,
  goal_id: string,
  data: Partial<{
    name?: string;
    target_gpa?: number;
    target_semester_id?: string;
    is_achieved?: boolean;
  }>,
) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  logger.info(`Editing goal ${goal_id} for user ${user_id} with data: ${JSON.stringify(data)}`);
  return await updateGoal(goal_id, data);
};

export const removeGoal = async (user_id: string, goal_id: string) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  logger.info(`Removing goal ${goal_id} for user ${user_id}`);
  return await deleteGoal(goal_id);
};

export const getGoalByUserId = async (user_id: string) => {
  const goals = await findGoalByUserId(user_id);

  logger.info(`Retrieved ${goals.length} goals for user ${user_id}`);
  return goals;
};

export const getGoalById = async (user_id: string, goal_id: string) => {
  const goal = await findGoalById(goal_id);

  if (!goal || goal.user_id !== user_id) {
    throw createHttpError.NotFound("Goal not found");
  }

  logger.info(`Retrieved goal ${goal_id} for user ${user_id}`);
  return goal;
};
