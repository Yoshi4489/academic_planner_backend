import type { Response, NextFunction, Request } from "express";
import createHttpError from "http-errors";
import {
  checkOTP,
  loginUser,
  logoutAllSessions,
  logoutUser,
  refreshToken,
  registerUser,
  requestResetPassword,
  resetPassword,
  getUserById,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../services/auth.services.js";
import { isValidOtpPurpose } from "../repositories/auth.repo.js";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createHttpError.BadRequest("Name, email and password are required");
    }

    const { user, access_token, refresh_token } = await registerUser(
      name,
      password,
      email,
      { deviceInfo: req.get("user-agent"), ipAddress: req.ip },
    );

    return res.status(201).json({
      message: "User registered successfully",
      user,
      access_token,
      refresh_token,
    });
  } catch (error) {
    next(error);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError.BadRequest("Email and password are required");
    }

    const { user, access_token, refresh_token } = await loginUser(
      email,
      password,
      { deviceInfo: req.get("user-agent"), ipAddress: req.ip },
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      access_token,
      refresh_token,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createHttpError.BadRequest("Invalid token");
    }

    const { access_token, refresh_token, user } = await refreshToken(token, {
      deviceInfo: req.get("user-agent"),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      access_token,
      refresh_token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRequestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await requestResetPassword(email);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleVerifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({
        message: "Email, OTP, and purpose are required",
      });
    }

    // Fix #8: reject unrecognized purpose values before hitting the DB
    if (!isValidOtpPurpose(purpose)) {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    const resetToken = await checkOTP(email, otp, purpose);

    // Fix #7: on success return 200 with the reset token;
    // invalid/expired OTPs throw from the service layer and are caught below
    return res.status(200).json({
      message: "OTP verified successfully",
      reset_token: resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const handleResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const result = await resetPassword(token, newPassword);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    const { refresh_token } = req.body as { refresh_token?: string };
    if (!refresh_token) throw createHttpError.BadRequest("Refresh token is required");
    await logoutUser(req.user.user_id, refresh_token);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const handleLogoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    await logoutAllSessions(req.user.user_id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const handleGetProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    const user = await getUserById(req.user.user_id);
    if (!user) throw createHttpError.NotFound("User not found");
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    const user = await updateProfile(req.user.user_id, req.body);
    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const handleChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    const result = await changePassword(
      req.user.user_id,
      req.body.current_password,
      req.body.new_password,
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleDeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw createHttpError.Unauthorized();
    await deleteAccount(req.user.user_id, req.body.password);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
