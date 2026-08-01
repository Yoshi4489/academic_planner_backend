import {
  response,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import createHttpError from "http-errors";
import {
  addCourse,
  editCourse,
  getCourseById,
  getCoursesBySemesterId,
  removeCourse,
  removeCourseBySemesterId,
} from "../services/course.service";

export const handleCreateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes,
    } = req.body;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!name || !grade || !credit || !type || !semester_id || !category) {
      throw createHttpError.BadRequest("Missing required fields");
    }

    const user_id = user.user_id;

    const course = await addCourse(user_id, {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes,
    });

    res.status(201).json({
      message: "Create course successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { course_id } = req.params;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError.BadRequest("Invalid course_id");
    }

    const user_id = user.user_id;
    const course = await getCourseById(user_id, { course_id });

    res.status(200).json({
      message: "Fetch course successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetCourseBySemesterId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError.BadRequest("Invalid semester_id");
    }

    const user_id = user.user_id;

    const courses = await getCoursesBySemesterId(user_id, { semester_id });

    res.status(200).json({
      message: "Fetch courses successfully",
      courses,
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
    const {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes,
    } = req.body;
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
      category,
      course_code,
      instructor,
      notes,
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
    const { course_id } = req.params;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError.BadRequest("Invalid course_id");
    }

    const user_id = user.user_id;
    const course = await removeCourse(user_id, { course_id });
    res.status(200).json({
      message: "Delete course successfully",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteCourseBySemester = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;

    if (!user || !user.user_id) {
      throw createHttpError.Unauthorized("Unauthorized");
    }

    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError.BadRequest("Invalid semester_id");
    }

    const user_id = user.user_id;
    const courses = await removeCourseBySemesterId(user_id, { semester_id });
    res.status(200).json({
      message: "Delete courses successfully",
      courses,
    });
  } catch (error) {
    next(error);
  }
};
