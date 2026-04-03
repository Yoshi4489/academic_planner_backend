import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {
  addSemester,
  editSemester,
  getSemesters,
  removeSemester,
} from "../services/semester.services";

export const handleCreateSemester = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { semester_year, term, is_complete } = req.body;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    const user_id = user.user_id;

    const semester = await addSemester({
      semester_year,
      term,
      is_complete,
      user_id,
    });
    res.status(201).json({
      message: "Create semester successfully",
      semester,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSemesters = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    const user_id = user.user_id;

    const semesters = await getSemesters({ user_id });
    res.status(200).json({
      message: "Get semesters successfully",
      semesters,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateSemester = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    const { id } = req.params;
    const { semester_year, term, is_complete } = req.body;

    if (id === undefined || Array.isArray(id)) {
      throw createHttpError.BadRequest("Missing semester id");
    }

    const semester = await editSemester({
      id: id as string,
      user_id: user.user_id,
      data: { semester_year, term, is_complete },
    });

    res.status(200).json({
      message: "Update semester successfully",
      semester,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteSemester = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    const { id } = req.params;

    if (id === undefined || Array.isArray(id)) {
      throw createHttpError.BadRequest("Missing semester id");
    }

    const semester = await removeSemester({
      id: id as string,
      user_id: user.user_id,
    });

    res.status(200).json({
      message: "Delete semester successfully",
      semester,
    });
  } catch (error) {
    next(error);
  }
};
