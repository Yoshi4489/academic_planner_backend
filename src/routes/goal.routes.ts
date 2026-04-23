import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import { validate } from "../middleware/validate.middleware";
import { createGoalSchema } from "../utils/goal.validator";
import {
  handleAddGoal,
  handleEditGoal,
  handleGetGoalById,
  handleGetGoalsByUserId,
  handleRemoveGoal,
} from "../controllers/goal.controller";

const goalRouter = Router();

goalRouter.post(
  "/createGoal",
  authMiddleware,
  validate(createGoalSchema),
  handleAddGoal,
);

goalRouter.patch("/updateGoal/:goal_id", authMiddleware, handleEditGoal);

goalRouter.delete("/deleteGoal/:goal_id", authMiddleware, handleRemoveGoal);

goalRouter.get("/getGoalByUserId", authMiddleware, handleGetGoalsByUserId);

goalRouter.get("/getGoalById/:goal_id", authMiddleware, handleGetGoalById);

export default goalRouter;
