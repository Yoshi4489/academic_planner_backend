import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  handleCreateSemester,
  handleDeleteSemester,
  handleGetSemesterById,
  handleGetSemesters,
  handleUpdateSemester,
} from "../controllers/semester.controller";
import { validate } from "../middleware/validate.middleware";
import { createSemesterSchema } from "../utils/semester.validator";

const semesterRouter = Router();

semesterRouter.post(
  "/addSemester",
  authMiddleware,
  validate(createSemesterSchema),
  handleCreateSemester,
);

semesterRouter.patch("/updateSemester/:semester_id", authMiddleware, handleUpdateSemester);

semesterRouter.delete("/deleteSemester/:semester_id", authMiddleware, handleDeleteSemester);

semesterRouter.get(
  "/getSemesterById/:semester_id",
  authMiddleware,
  handleGetSemesterById,
);

semesterRouter.get("/getSemesters", authMiddleware, handleGetSemesters);

export default semesterRouter;
