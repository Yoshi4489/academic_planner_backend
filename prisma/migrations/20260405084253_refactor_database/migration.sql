/*
  Warnings:

  - You are about to drop the column `target_semester` on the `Goal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year,term_no,user_id]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.
  - Made the column `grade_point` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `target_semester_id` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term_no` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatLog" DROP CONSTRAINT "ChatLog_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "GPA" DROP CONSTRAINT "GPA_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "GPA" DROP CONSTRAINT "GPA_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_user_id_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "grade_point" SET NOT NULL;

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "target_semester",
ADD COLUMN     "target_semester_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "term_no" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "ChatLog_user_id_idx" ON "ChatLog"("user_id");

-- CreateIndex
CREATE INDEX "Course_semester_id_idx" ON "Course"("semester_id");

-- CreateIndex
CREATE INDEX "GPA_user_id_idx" ON "GPA"("user_id");

-- CreateIndex
CREATE INDEX "GPA_semester_id_idx" ON "GPA"("semester_id");

-- CreateIndex
CREATE INDEX "Goal_user_id_idx" ON "Goal"("user_id");

-- CreateIndex
CREATE INDEX "Goal_target_semester_id_idx" ON "Goal"("target_semester_id");

-- CreateIndex
CREATE INDEX "Semester_user_id_idx" ON "Semester"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_year_term_no_user_id_key" ON "Semester"("year", "term_no", "user_id");

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPA" ADD CONSTRAINT "GPA_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GPA" ADD CONSTRAINT "GPA_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_target_semester_id_fkey" FOREIGN KEY ("target_semester_id") REFERENCES "Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatLog" ADD CONSTRAINT "ChatLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
