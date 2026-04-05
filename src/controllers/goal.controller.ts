import type { NextFunction, Request, Response } from "express";
import {
  addGoal,
  editGoal,
  getGoalById,
  getGoalByUserId,
  removeGoal,
} from "../services/goal.service";
import createHttpError from "http-errors";

export const handleAddGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    const { name, target_gpa, target_semester } = req.body;

    if (!user || !user?.user_id) {
      throw createHttpError.Unauthorized("User not authenticated");
    }

    if (!target_gpa || !target_semester) {
      throw createHttpError.BadRequest("Invalid required fields");
    }

    const user_id = user.user_id;

    const goal = await addGoal({
      user_id,
      name,
      target_gpa,
      target_semester,
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    next(error);
  }
};

export const handleEditGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const { goal_id } = req.params;
    const { name, target_gpa, target_semester } = req.body;

    if (!user || !user?.user_id) {
      throw createHttpError.Unauthorized("User not authenticated");
    }

    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError.BadRequest("Invalid goal ID");
    }

    if (!name && !target_gpa && !target_semester) {
      throw createHttpError.BadRequest("No fields to update");
    }

    const user_id = user.user_id;
    const updatedGoal = await editGoal(user_id, goal_id, {
      name,
      target_gpa,
      target_semester,
    });

    res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRemoveGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    const { goal_id } = req.params;

    if (!user || !user?.user_id) {
      throw createHttpError.Unauthorized("User not authenticated");
    }

    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError.BadRequest("Invalid goal ID");
    }

    const user_id = user.user_id;
    const removedGoal = await removeGoal(user_id, goal_id);

    res.status(200).json({
      message: "Goal removed successfully",
      goal: removedGoal,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetGoalsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user || !user?.user_id) {
      throw createHttpError.Unauthorized("User not authenticated");
    }

    const user_id = user.user_id;
    const goals = await getGoalByUserId(user_id);

    res.status(200).json({
      message: "Goals retrieved successfully",
      goals,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetGoalById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const { goal_id } = req.params;

    if (!user || !user?.user_id) {
      throw createHttpError.Unauthorized("User not authenticated");
    }

    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError.BadRequest("Invalid goal ID");
    }

    const user_id = user.user_id;
    const goal = await getGoalById(user_id, goal_id);

    res.status(200).json({
      message: "Goal retrieved successfully",
      goal,
    });
  } catch (error) {
    next(error);
  }
};
