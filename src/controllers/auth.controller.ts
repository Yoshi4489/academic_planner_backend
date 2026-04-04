import type { Response, NextFunction, Request } from "express";
import createHttpError from "http-errors";
import {
  getUsers,
  loginUser,
  refreshToken,
  registerUser,
} from "../services/auth.services.js";

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

    const { access_token } = await refreshToken(token);

    return res.status(200).json({
      message: "Token refreshed successfully",
      access_token,
    });
  } catch (error) {
    next(error);
  }
};
