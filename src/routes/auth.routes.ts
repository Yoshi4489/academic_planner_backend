import { Router } from "express";
import {
  handleLogin,
  handleLogout,
  handleLogoutAll,
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleDeleteAccount,
  handleRefreshToken,
  handleRegister,
  handleResetPassword,
  handleVerifyOTP,
  handleRequestPasswordReset,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createRateLimit } from "../middleware/rate-limit.middleware.js";
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  logoutSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "../utils/auth.validator.js";

const authRouter = Router();
const authAttemptLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  includeEmail: true,
});
const recoveryLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  includeEmail: true,
});
const refreshLimit = createRateLimit({ windowMs: 60 * 1000, max: 30 });

authRouter.post("/register", authAttemptLimit, validate(registerSchema), handleRegister);

authRouter.post("/login", authAttemptLimit, validate(loginSchema), handleLogin);

authRouter.post("/refresh-token", refreshLimit, handleRefreshToken);

authRouter.post("/logout", authMiddleware, validate(logoutSchema), handleLogout);
authRouter.post("/logout-all", authMiddleware, handleLogoutAll);
authRouter.get("/me", authMiddleware, handleGetProfile);
authRouter.patch("/me", authMiddleware, validate(updateProfileSchema), handleUpdateProfile);
authRouter.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  handleChangePassword,
);
authRouter.delete(
  "/me",
  authMiddleware,
  validate(deleteAccountSchema),
  handleDeleteAccount,
);

authRouter.post(
  "/request-password-reset",
  recoveryLimit,
  validate(requestPasswordResetSchema),
  handleRequestPasswordReset,
);

authRouter.post(
  "/reset-password",
  recoveryLimit,
  validate(resetPasswordSchema),
  handleResetPassword,
);

authRouter.post("/verify-otp", recoveryLimit, validate(verifyOtpSchema), handleVerifyOTP);

export default authRouter;
