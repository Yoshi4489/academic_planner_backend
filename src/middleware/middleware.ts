import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import createHttpError from "http-errors";

declare module "express-serve-static-core" {
  interface Request {
    user?: ReturnType<typeof verifyToken>;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw createHttpError.Unauthorized("No token provided");

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    next(createHttpError.Unauthorized("Invalid token"));
  }
};
