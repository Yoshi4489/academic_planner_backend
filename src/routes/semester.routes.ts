import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import { getSemesters } from "../services/semester.services";
import { handleCreateSemester } from "../controllers/semester.controller";
import { deleteSemester } from "../repositories/semester.repo";
import { validate } from "../middleware/validate.middleware";
import { createSemesterSchema } from "../utils/semester.validator";

const semesterRouter = Router();

semesterRouter.post(
  "/addSemester",
  authMiddleware,
  validate(createSemesterSchema),
  handleCreateSemester,
);

semesterRouter.put("/updateSemester/:id", authMiddleware, handleCreateSemester);

semesterRouter.delete("/deleteSemester/:id", authMiddleware, deleteSemester);

semesterRouter.get("/getSemesters", authMiddleware, getSemesters);

export default semesterRouter;
