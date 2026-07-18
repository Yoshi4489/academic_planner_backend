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
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../utils/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), handleRegister);

authRouter.post("/login", validate(loginSchema), handleLogin);

authRouter.get("/users", authMiddleware, handleGetUsers);

authRouter.post("/refresh-token", handleRefreshToken);

authRouter.post(
  "/request-password-reset",
  validate(requestPasswordResetSchema),
  handleRequestPasswordReset,
);

authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  handleResetPassword,
);

authRouter.post("/verify-otp", validate(verifyOtpSchema), handleVerifyOTP);

export default authRouter;
