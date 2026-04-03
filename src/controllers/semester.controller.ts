import type { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors";

export const handleCreateSemester = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const { semester_year, term, is_complete } = req.body;
        const user = req.user;

        if (!semester_year || !term || is_complete === undefined) {
            throw createHttpError.BadRequest("Missing required fields");
        }
    } catch (error) {
        next(error);
    }
}
