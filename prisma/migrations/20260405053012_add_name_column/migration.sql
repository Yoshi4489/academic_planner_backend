/*
  Warnings:

  - Added the required column `total_credits` to the `GPA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_grade_points` to the `GPA` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('GEN_ED', 'MAJOR_REQUIRED', 'MAJOR_ELECTIVE', 'MINOR', 'FREE_ELECTIVE');

-- AlterTable
ALTER TABLE "ChatLog" ADD COLUMN     "context" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" "CourseType" NOT NULL DEFAULT 'GEN_ED';

-- AlterTable
ALTER TABLE "GPA" ADD COLUMN     "total_credits" INTEGER NOT NULL,
ADD COLUMN     "total_grade_points" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "is_achieved" BOOLEAN NOT NULL DEFAULT false;
