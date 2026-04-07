import type { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import { getGPABySemesterId, getGPAByUserId } from "../services/gpa.services";

export const handleGetGPABySemesterId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;

    if (!user || user.user_id === undefined) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError.BadRequest("Invalid semester ID");
    }

    const user_id = user.user_id;
    const gpa = await getGPABySemesterId(semester_id, user_id);

    if (!gpa) {
      throw createHttpError.NotFound(
        "GPA not found for the specified semester",
      );
    }

    res.status(200).json({
      message: "GPA retrieved successfully",
      gpa,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetGPAsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    if (!user || user.user_id === undefined) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    const user_id = user.user_id;

    const gpas = await getGPAByUserId(user_id);

    res.status(200).json({
      message: "GPAs retrieved successfully",
      gpas,
    });
  } catch (error) {
    next(error);
  }
};
