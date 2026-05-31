import { Router } from "express";
import {
  handleGetUsers,
  handleLogin,
  handleRefreshToken,
  handleRegister,
  handleResetPassword,
  handleVerifyOTP,
  handleRequestPasswordReset,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../utils/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), handleRegister);

authRouter.post("/login", validate(loginSchema), handleLogin);

authRouter.get("/users", authMiddleware, handleGetUsers);

authRouter.post("/refresh-token", handleRefreshToken);

authRouter.post("/request-password-reset", handleRequestPasswordReset);

authRouter.post("/reset-password", handleResetPassword);

authRouter.post("/verify-otp", handleVerifyOTP);

export default authRouter;
