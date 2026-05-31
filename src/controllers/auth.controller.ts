import type { Response, NextFunction, Request } from "express";
import createHttpError from "http-errors";
import {
  checkOTP,
  getUsers,
  loginUser,
  refreshToken,
  registerUser,
  requestResetPassword,
  resetPassword,
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

// Fix #11: ensure this route is protected by your auth middleware at the router level
export const handleGetUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, name, email } = req.query;

    const users = await getUsers(id as string, name as string, email as string);

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
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

    const { access_token, user } = await refreshToken(token);

    return res.status(200).json({
      message: "Token refreshed successfully",
      access_token,
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