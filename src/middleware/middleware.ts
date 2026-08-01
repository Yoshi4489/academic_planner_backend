import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import createHttpError from "http-errors";
import logger from "../config/logger.js";
import { randomUUID } from "node:crypto";

type JwtPayload = {
  user_id: string;
  email: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
    requestId?: string;
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const supplied = req.get("x-request-id");
  req.requestId = supplied?.slice(0, 100) || randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

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
    logger.warn(`Unauthorized access attempt - ${req.method} ${req.url}`);
    next(createHttpError.Unauthorized("Invalid token"));
  }
};
