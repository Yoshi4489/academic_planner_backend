import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {
  addMeeting,
  addPrerequisite,
  assignRequirement,
  createRequirement,
  createTask,
  listRequirements,
  listSchedule,
  listTasks,
  removeMeeting,
  removePrerequisite,
  removeRequirement,
  removeTask,
  updateRequirement,
  updateTask,
} from "../services/planner.service.js";

const userId = (req: Request) => {
  if (!req.user) throw createHttpError.Unauthorized();
  return req.user.user_id;
};

const param = (req: Request, name: string) => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw createHttpError.BadRequest(`Invalid ${name}`);
  return value;
};

const action = (
  handler: (req: Request) => Promise<unknown>,
  status = 200,
) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await handler(req);
    res.status(status).json({ data });
  } catch (error) {
    next(error);
  }
};

export const handleAddMeeting = action(
  (req) => addMeeting(userId(req), param(req, "course_id"), req.body),
  201,
);
export const handleDeleteMeeting = action((req) =>
  removeMeeting(userId(req), param(req, "meeting_id")),
);
export const handleSchedule = action((req) => listSchedule(userId(req)));
export const handleCreateTask = action(
  (req) => createTask(userId(req), param(req, "course_id"), req.body),
  201,
);
export const handleUpdateTask = action((req) =>
  updateTask(userId(req), param(req, "task_id"), req.body),
);
export const handleDeleteTask = action((req) =>
  removeTask(userId(req), param(req, "task_id")),
);
export const handleTasks = action((req) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    throw createHttpError.BadRequest("Invalid date range");
  }
  return listTasks(userId(req), from, to);
});
export const handleAddPrerequisite = action(
  (req) => addPrerequisite(
    userId(req),
    param(req, "course_id"),
    req.body.prerequisite_id,
  ),
  201,
);
export const handleDeletePrerequisite = action((req) =>
  removePrerequisite(
    userId(req),
    param(req, "course_id"),
    param(req, "prerequisite_id"),
  ),
);
export const handleCreateRequirement = action(
  (req) => createRequirement(userId(req), req.body),
  201,
);
export const handleUpdateRequirement = action((req) =>
  updateRequirement(userId(req), param(req, "requirement_id"), req.body),
);
export const handleDeleteRequirement = action((req) =>
  removeRequirement(userId(req), param(req, "requirement_id")),
);
export const handleRequirements = action((req) => listRequirements(userId(req)));
export const handleAssignRequirement = action((req) =>
  assignRequirement(
    userId(req),
    param(req, "course_id"),
    req.body.requirement_id,
  ),
);
