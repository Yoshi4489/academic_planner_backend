import type { Grade } from "../generated/prisma/enums";

export const gradePointMap: Record<Grade, number> = {
  A: 4.0,
  B_PLUS: 3.5,
  B: 3.0,
  C_PLUS: 2.5,
  C: 2.0,
  D_PLUS: 1.5,
  D: 1.0,
  F: 0,
};
