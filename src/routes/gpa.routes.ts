import { Router } from "express";
import {
  handleGetGPABySemesterId,
  handleGetGPAsByUserId,
} from "../controllers/gpa.controller";
import { authMiddleware } from "../middleware/middleware";

const gpaRouter = Router();

gpaRouter.get(
  "/getGPABySemester/:semester_id",
  authMiddleware,
  handleGetGPABySemesterId,
);

gpaRouter.get("/getGPAsByUserId", authMiddleware, handleGetGPAsByUserId);

export default gpaRouter;
