import { Router } from "express";
import {
  handleGetUsers,
  handleLogin,
  handleRegister,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../utils/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), handleRegister);

authRouter.post("/login", validate(loginSchema), handleLogin);

authRouter.get("/users", authMiddleware, handleGetUsers);

export default authRouter;
