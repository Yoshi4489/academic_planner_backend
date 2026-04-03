import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { addCourse, editCourse } from "../services/course.service";

export const handleCreateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, grade, credit, type, semester_id } = req.body;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!name || !grade || !credit || !type || !semester_id) {
      throw createHttpError.BadRequest("Missing required fields");
    }

    const user_id = user.user_id;

    const course = await addCourse(user_id, {
      name,
      grade,
      credit,
      type,
      semester_id,
    });

    res.status(201).json({
      message: "Create course successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const handleEditCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { course_id } = req.params;
    const { name, grade, credit, type, semester_id } = req.body;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError.BadRequest("Invalid course_id");
    }

    const user_id = user.user_id;
    const course = await editCourse(course_id, user_id, {
      name,
      grade,
      credit,
      type,
      semester_id,
    });

    res.status(200).json({
      message: "Edit course successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {
    next(error);
  }
};
