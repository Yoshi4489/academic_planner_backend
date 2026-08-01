CREATE TYPE "AcademicTaskType" AS ENUM ('ASSIGNMENT', 'EXAM', 'QUIZ', 'PROJECT', 'OTHER');

ALTER TABLE "Course"
  ADD COLUMN "course_code" TEXT,
  ADD COLUMN "instructor" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "requirement_id" TEXT;

CREATE TABLE "CourseMeeting" (
  "id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "start_minute" INTEGER NOT NULL,
  "end_minute" INTEGER NOT NULL,
  "location" TEXT,
  "course_id" TEXT NOT NULL,
  CONSTRAINT "CourseMeeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicTask" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "AcademicTaskType" NOT NULL,
  "due_at" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "is_complete" BOOLEAN NOT NULL DEFAULT false,
  "reminder_offset_minutes" INTEGER DEFAULT 1440,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "course_id" TEXT NOT NULL,
  CONSTRAINT "AcademicTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CoursePrerequisite" (
  "course_id" TEXT NOT NULL,
  "prerequisite_id" TEXT NOT NULL,
  CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("course_id", "prerequisite_id")
);

CREATE TABLE "DegreeRequirement" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "required_credits" INTEGER NOT NULL,
  "color" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  CONSTRAINT "DegreeRequirement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Course_requirement_id_idx" ON "Course"("requirement_id");
CREATE INDEX "CourseMeeting_course_id_idx" ON "CourseMeeting"("course_id");
CREATE INDEX "AcademicTask_course_id_idx" ON "AcademicTask"("course_id");
CREATE INDEX "AcademicTask_due_at_idx" ON "AcademicTask"("due_at");
CREATE INDEX "CoursePrerequisite_prerequisite_id_idx" ON "CoursePrerequisite"("prerequisite_id");
CREATE INDEX "DegreeRequirement_user_id_idx" ON "DegreeRequirement"("user_id");

ALTER TABLE "Course" ADD CONSTRAINT "Course_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "DegreeRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseMeeting" ADD CONSTRAINT "CourseMeeting_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicTask" ADD CONSTRAINT "AcademicTask_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DegreeRequirement" ADD CONSTRAINT "DegreeRequirement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
