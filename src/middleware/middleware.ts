import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import createHttpError from "http-errors";

type JwtPayload = {
  user_id: string;
  email: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError.Unauthorized("Invalid authorization format");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw createHttpError.Unauthorized("Invalid authorization format");
    }

    const decoded = verifyToken(token) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(createHttpError.Unauthorized("Invalid token"));
  }
};
