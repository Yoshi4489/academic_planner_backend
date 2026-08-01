import createHttpError from "http-errors";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import prisma from "../config/prisma.js";
import { gradePointMap } from "../utils/grade.js";
import type { GuestSnapshot } from "../utils/data-transfer.validator.js";
import { recalculateUserGpas } from "./gpa.services.js";

const snapshotHash = (snapshot: GuestSnapshot) =>
  createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");

const signature = (value: string) =>
  createHmac("sha256", process.env.REFRESH_SECRET_KEY as string)
    .update(value)
    .digest("hex");

export const createMergeToken = (userId: string, snapshot: GuestSnapshot) => {
  const expires = Date.now() + 10 * 60 * 1000;
  const payload = `${userId}.${snapshotHash(snapshot)}.${expires}`;
  return `${expires}.${signature(payload)}`;
};

export const verifyMergeToken = (
  userId: string,
  snapshot: GuestSnapshot,
  token: string,
) => {
  const [rawExpires, provided] = token.split(".");
  const expires = Number(rawExpires);
  if (!provided || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = signature(`${userId}.${snapshotHash(snapshot)}.${expires}`);
  const actualBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer);
};

export const exportUserData = async (userId: string) => {
  const [semesters, goals, requirements] = await Promise.all([
    prisma.semester.findMany({
      where: { user_id: userId },
      orderBy: [{ year: "asc" }, { term_no: "asc" }],
      include: { courses: { include: { meetings: true, tasks: true } }, gpas: true },
    }),
    prisma.goal.findMany({ where: { user_id: userId } }),
    prisma.degreeRequirement.findMany({ where: { user_id: userId } }),
  ]);
  return {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    semesters,
    goals,
    degree_requirements: requirements,
  };
};

export const previewGuestImport = async (
  userId: string,
  snapshot: GuestSnapshot,
) => {
  const keys = snapshot.semesters.map((semester) => ({
    year: semester.year,
    term_no: semester.term_no,
  }));
  const existing = keys.length
    ? await prisma.semester.findMany({
        where: { user_id: userId, OR: keys },
        select: { id: true, year: true, term_no: true, term: true },
      })
    : [];
  return {
    merge_token: createMergeToken(userId, snapshot),
    conflicts: snapshot.semesters.flatMap((guest) => {
      const cloud = existing.find(
        (item) => item.year === guest.year && item.term_no === guest.term_no,
      );
      return cloud ? [{ guest_semester_id: guest.id, guest, cloud }] : [];
    }),
    counts: {
      semesters: snapshot.semesters.length,
      courses: snapshot.semesters.reduce((sum, item) => sum + item.courses.length, 0),
      goals: snapshot.goals.length,
    },
  };
};

export const commitGuestImport = async (
  userId: string,
  idempotencyKey: string,
  snapshot: GuestSnapshot,
  mergeToken: string,
  decisions: Array<{
    semester_id: string;
    action: "KEEP_CLOUD" | "REPLACE_CLOUD" | "MERGE_COURSES";
  }>,
) => {
  if (!verifyMergeToken(userId, snapshot, mergeToken)) {
    throw createHttpError.Unauthorized("Invalid or expired merge token");
  }

  return prisma.$transaction(async (tx) => {
    const previous = await tx.importOperation.findUnique({
      where: { user_id_key: { user_id: userId, key: idempotencyKey } },
    });
    if (previous) return previous.response;

    const decisionMap = new Map(
      decisions.map((decision) => [decision.semester_id, decision.action]),
    );
    const semesterMap = new Map<string, string>();
    let importedSemesters = 0;
    let importedCourses = 0;

    for (const guest of snapshot.semesters) {
      let cloud = await tx.semester.findFirst({
        where: { user_id: userId, year: guest.year, term_no: guest.term_no },
        include: { courses: true },
      });
      const action = decisionMap.get(guest.id) ?? "KEEP_CLOUD";

      if (cloud && action === "REPLACE_CLOUD") {
        await tx.semester.delete({ where: { id: cloud.id } });
        cloud = null;
      }

      if (!cloud) {
        cloud = await tx.semester.create({
          data: {
            year: guest.year,
            term: guest.term,
            term_no: guest.term_no,
            is_complete: guest.is_complete,
            user_id: userId,
          },
          include: { courses: true },
        });
        importedSemesters += 1;
      }
      semesterMap.set(guest.id, cloud.id);

      if (action === "KEEP_CLOUD" && cloud.courses.length > 0) continue;
      const existingKeys = new Set(
        cloud.courses.map((course) =>
          `${course.name.trim().toLowerCase()}|${course.credit}|${course.category}`,
        ),
      );
      const courses = guest.courses.filter((course) => {
        const key = `${course.name.trim().toLowerCase()}|${course.credit}|${course.category}`;
        return action !== "MERGE_COURSES" || !existingKeys.has(key);
      });
      if (courses.length) {
        await tx.course.createMany({
          data: courses.map((course) => ({
            name: course.name,
            category: course.category,
            grade: course.grade,
            grade_point: gradePointMap[course.grade],
            credit: course.credit,
            type: course.type,
            semester_id: cloud!.id,
            ...(course.course_code !== undefined
              ? { course_code: course.course_code }
              : {}),
            ...(course.instructor !== undefined
              ? { instructor: course.instructor }
              : {}),
            ...(course.notes !== undefined ? { notes: course.notes } : {}),
          })),
        });
        importedCourses += courses.length;
      }
    }

    let importedGoals = 0;
    for (const goal of snapshot.goals) {
      const targetSemesterId = semesterMap.get(goal.target_semester_id);
      if (!targetSemesterId) continue;
      await tx.goal.create({
        data: {
          name: goal.name,
          target_gpa: goal.target_gpa,
          is_achieved: goal.is_achieved,
          target_semester_id: targetSemesterId,
          user_id: userId,
        },
      });
      importedGoals += 1;
    }

    await recalculateUserGpas(userId, tx);
    const result = { imported_semesters: importedSemesters, imported_courses: importedCourses, imported_goals: importedGoals };
    await tx.importOperation.create({
      data: { user_id: userId, key: idempotencyKey, response: result },
    });
    return result;
  });
};
