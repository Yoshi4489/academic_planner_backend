import { Router } from "express";
import authRouter from "./auth.routes.js";
import semesterRouter from "./semester.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/semesters", semesterRouter);

export default router;