import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  handleCreateCourse,
  handleDeleteCourse,
  handleDeleteCourseBySemester,
  handleEditCourse,
  handleGetCourseById,
  handleGetCourseBySemesterId,
} from "../controllers/course.controller";
import { validate } from "../middleware/validate.middleware";
import { createCourseSchema } from "../utils/course.validator";

const courseRouter = Router();

courseRouter.post(
  "/createCourse",
  authMiddleware,
  validate(createCourseSchema),
  handleCreateCourse,
);

courseRouter.put("/editCourse/:course_id", authMiddleware, handleEditCourse);

courseRouter.delete(
  "/deleteCourse/:course_id",
  authMiddleware,
  handleDeleteCourse,
);

courseRouter.delete(
  "/deleteCourseBySemesterId/:semester_id",
  authMiddleware,
  handleDeleteCourseBySemester,
);

courseRouter.get(
  "/getCoursesBySemesterId/:semester_id",
  authMiddleware,
  handleGetCourseBySemesterId,
);

courseRouter.get(
  "/getCourseById/:course_id",
  authMiddleware,
  handleGetCourseById,
);

export default courseRouter;
