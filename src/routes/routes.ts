import { Router } from "express";
import authRouter from "./auth.routes.js";
import semesterRouter from "./semester.routes.js";
import courseRouter from "./course.routes.js";
import goalRouter from "./goal.routes.js";
import gpaRouter from "./gpa.routes.js";
import plannerRouter from "./planner.routes.js";
import dataTransferRouter from "./data-transfer.routes.js";
import notificationRouter from "./notification.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/semesters", semesterRouter);
router.use("/courses", courseRouter);
router.use("/goals", goalRouter);
router.use("/gpa", gpaRouter);
router.use("/planner", plannerRouter);
router.use("/data", dataTransferRouter);
router.use("/notifications", notificationRouter);

export default router;
