import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {
  commitGuestImport,
  exportUserData,
  previewGuestImport,
} from "../services/data-transfer.service.js";

const currentUserId = (req: Request) => {
  if (!req.user) throw createHttpError.Unauthorized();
  return req.user.user_id;
};

export const handleExport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(await exportUserData(currentUserId(req)));
  } catch (error) {
    next(error);
  }
};

export const handleImportPreview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json(await previewGuestImport(currentUserId(req), req.body));
  } catch (error) {
    next(error);
  }
};

export const handleImportCommit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const key = req.get("idempotency-key")?.trim();
    if (!key || key.length < 8 || key.length > 100) {
      throw createHttpError.BadRequest("A valid Idempotency-Key header is required");
    }
    const result = await commitGuestImport(
      currentUserId(req),
      key,
      req.body.snapshot,
      req.body.merge_token,
      req.body.decisions,
    );
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};
