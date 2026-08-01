import createHttpError from "http-errors";
import prisma from "../config/prisma.js";
import type { AcademicTaskType } from "../generated/prisma/enums.js";

const ownedCourse = (id: string, userId: string) =>
  prisma.course.findFirst({
    where: { id, semester: { user_id: userId } },
  });

export const addMeeting = async (
  userId: string,
  courseId: string,
  data: {
    weekday: number;
    start_minute: number;
    end_minute: number;
    location?: string | null;
  },
) => {
  if (!(await ownedCourse(courseId, userId))) {
    throw createHttpError.NotFound("Course not found");
  }
  const conflict = await prisma.courseMeeting.findFirst({
    where: {
      weekday: data.weekday,
      start_minute: { lt: data.end_minute },
      end_minute: { gt: data.start_minute },
      course: { semester: { user_id: userId } },
    },
  });
  if (conflict) throw createHttpError.Conflict("Meeting overlaps another course");
  return prisma.courseMeeting.create({ data: { ...data, course_id: courseId } });
};

export const removeMeeting = async (userId: string, meetingId: string) => {
  const meeting = await prisma.courseMeeting.findFirst({
    where: { id: meetingId, course: { semester: { user_id: userId } } },
  });
  if (!meeting) throw createHttpError.NotFound("Meeting not found");
  return prisma.courseMeeting.delete({ where: { id: meetingId } });
};

export const listSchedule = (userId: string) =>
  prisma.courseMeeting.findMany({
    where: { course: { semester: { user_id: userId } } },
    include: { course: { select: { id: true, name: true, course_code: true } } },
    orderBy: [{ weekday: "asc" }, { start_minute: "asc" }],
  });

export const createTask = async (
  userId: string,
  courseId: string,
  data: {
    title: string;
    type: AcademicTaskType;
    due_at: string;
    notes?: string | null;
    is_complete?: boolean;
    reminder_offset_minutes?: number | null;
  },
) => {
  if (!(await ownedCourse(courseId, userId))) {
    throw createHttpError.NotFound("Course not found");
  }
  return prisma.academicTask.create({
    data: { ...data, due_at: new Date(data.due_at), course_id: courseId },
  });
};

export const updateTask = async (
  userId: string,
  taskId: string,
  data: Partial<{
    title: string;
    type: AcademicTaskType;
    due_at: string;
    notes: string | null;
    is_complete: boolean;
    reminder_offset_minutes: number | null;
  }>,
) => {
  const task = await prisma.academicTask.findFirst({
    where: { id: taskId, course: { semester: { user_id: userId } } },
  });
  if (!task) throw createHttpError.NotFound("Task not found");
  const { due_at, ...rest } = data;
  return prisma.academicTask.update({
    where: { id: taskId },
    data: { ...rest, ...(due_at ? { due_at: new Date(due_at) } : {}) },
  });
};

export const removeTask = async (userId: string, taskId: string) => {
  const task = await prisma.academicTask.findFirst({
    where: { id: taskId, course: { semester: { user_id: userId } } },
  });
  if (!task) throw createHttpError.NotFound("Task not found");
  return prisma.academicTask.delete({ where: { id: taskId } });
};

export const listTasks = (userId: string, from?: Date, to?: Date) =>
  prisma.academicTask.findMany({
    where: {
      course: { semester: { user_id: userId } },
      ...(from || to
        ? { due_at: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
        : {}),
    },
    include: { course: { select: { id: true, name: true, course_code: true } } },
    orderBy: { due_at: "asc" },
  });

export const addPrerequisite = async (
  userId: string,
  courseId: string,
  prerequisiteId: string,
) => {
  if (courseId === prerequisiteId) {
    throw createHttpError.BadRequest("A course cannot require itself");
  }
  const owned = await prisma.course.count({
    where: { id: { in: [courseId, prerequisiteId] }, semester: { user_id: userId } },
  });
  if (owned !== 2) throw createHttpError.NotFound("Course not found");

  const edges = await prisma.coursePrerequisite.findMany({
    where: { course: { semester: { user_id: userId } } },
  });
  const queue = [prerequisiteId];
  const visited = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!;
    if (current === courseId) {
      throw createHttpError.Conflict("Prerequisite cycle detected");
    }
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(
      ...edges.filter((edge) => edge.course_id === current)
        .map((edge) => edge.prerequisite_id),
    );
  }
  return prisma.coursePrerequisite.create({
    data: { course_id: courseId, prerequisite_id: prerequisiteId },
  });
};

export const removePrerequisite = (
  userId: string,
  courseId: string,
  prerequisiteId: string,
) => prisma.coursePrerequisite.deleteMany({
  where: {
    course_id: courseId,
    prerequisite_id: prerequisiteId,
    course: { semester: { user_id: userId } },
  },
});

export const createRequirement = (
  userId: string,
  data: { name: string; required_credits: number; color?: string | null; sort_order?: number },
) => prisma.degreeRequirement.create({ data: { ...data, user_id: userId } });

export const updateRequirement = async (
  userId: string,
  requirementId: string,
  data: Partial<{ name: string; required_credits: number; color: string | null; sort_order: number }>,
) => {
  const requirement = await prisma.degreeRequirement.findFirst({
    where: { id: requirementId, user_id: userId },
  });
  if (!requirement) throw createHttpError.NotFound("Requirement not found");
  return prisma.degreeRequirement.update({ where: { id: requirementId }, data });
};

export const removeRequirement = (userId: string, requirementId: string) =>
  prisma.degreeRequirement.deleteMany({ where: { id: requirementId, user_id: userId } });

export const assignRequirement = async (
  userId: string,
  courseId: string,
  requirementId: string | null,
) => {
  if (!(await ownedCourse(courseId, userId))) throw createHttpError.NotFound("Course not found");
  if (requirementId) {
    const requirement = await prisma.degreeRequirement.findFirst({
      where: { id: requirementId, user_id: userId },
    });
    if (!requirement) throw createHttpError.NotFound("Requirement not found");
  }
  return prisma.course.update({
    where: { id: courseId },
    data: { requirement_id: requirementId },
  });
};

export const listRequirements = async (userId: string) => {
  const requirements = await prisma.degreeRequirement.findMany({
    where: { user_id: userId },
    include: { courses: { select: { credit: true, type: true } } },
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
  });
  return requirements.map(({ courses, ...requirement }) => ({
    ...requirement,
    actual_credits: courses
      .filter((course) => course.type === "ACTUAL")
      .reduce((sum, course) => sum + course.credit, 0),
    projected_credits: courses.reduce((sum, course) => sum + course.credit, 0),
  }));
};
