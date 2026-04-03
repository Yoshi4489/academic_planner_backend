import type { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import type { ZodSchema } from "zod"

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body"
      return next(createHttpError.BadRequest(message))
    }
    req.body = result.data  // clean data
    next()
  }
}