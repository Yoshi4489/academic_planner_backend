import type { NextFunction, Request, Response } from "express"

export const handleCreateSemester = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const { semester_year, term, is_complete } = req.body;
        const user = req.user;
    } catch (error) {
        next(error);
    }
}