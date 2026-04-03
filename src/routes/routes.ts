import { Router } from "express";
import authRouter from "./auth.routes.js";
import semesterRouter from "./semester.routes.js";
import courseRouter from "./course.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/semesters", semesterRouter);
router.use("/courses", courseRouter);

export default router;