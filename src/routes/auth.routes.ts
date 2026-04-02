import { Router } from "express";
import {
  handleGetUsers,
  handleLogin,
  handleRegister,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/middleware.js";

const authRouter = Router();

authRouter.post("/register", handleRegister);

authRouter.post("/login", handleLogin);

authRouter.get("/users", authMiddleware, handleGetUsers);

export default authRouter;