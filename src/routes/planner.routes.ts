import { Router } from "express";
import { authMiddleware } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  assignRequirementSchema,
  meetingSchema,
  prerequisiteSchema,
  requirementSchema,
  taskSchema,
  updateRequirementSchema,
  updateTaskSchema,
} from "../utils/planner.validator.js";
import {
  handleAddMeeting,
  handleAddPrerequisite,
  handleAssignRequirement,
  handleCreateRequirement,
  handleCreateTask,
  handleDeleteMeeting,
  handleDeletePrerequisite,
  handleDeleteRequirement,
  handleDeleteTask,
  handleRequirements,
  handleSchedule,
  handleTasks,
  handleUpdateRequirement,
  handleUpdateTask,
} from "../controllers/planner.controller.js";

const router = Router();
router.use(authMiddleware);
router.get("/schedule", handleSchedule);
router.post("/courses/:course_id/meetings", validate(meetingSchema), handleAddMeeting);
router.delete("/meetings/:meeting_id", handleDeleteMeeting);
router.get("/tasks", handleTasks);
router.post("/courses/:course_id/tasks", validate(taskSchema), handleCreateTask);
router.patch("/tasks/:task_id", validate(updateTaskSchema), handleUpdateTask);
router.delete("/tasks/:task_id", handleDeleteTask);
router.post(
  "/courses/:course_id/prerequisites",
  validate(prerequisiteSchema),
  handleAddPrerequisite,
);
router.delete(
  "/courses/:course_id/prerequisites/:prerequisite_id",
  handleDeletePrerequisite,
);
router.get("/requirements", handleRequirements);
router.post("/requirements", validate(requirementSchema), handleCreateRequirement);
router.patch(
  "/requirements/:requirement_id",
  validate(updateRequirementSchema),
  handleUpdateRequirement,
);
router.delete("/requirements/:requirement_id", handleDeleteRequirement);
router.patch(
  "/courses/:course_id/requirement",
  validate(assignRequirementSchema),
  handleAssignRequirement,
);

export default router;
