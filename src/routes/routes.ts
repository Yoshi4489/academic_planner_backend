import { Router } from "express";
import authRouter from "./auth.routes.js";
import semesterRouter from "./semester.routes.js";
import courseRouter from "./course.routes.js";
import goalRouter from "./goal.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/semesters", semesterRouter);
router.use("/courses", courseRouter);
router.use("/goals", goalRouter);

export default router;
