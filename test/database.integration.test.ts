import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import prisma from "../src/config/prisma.js";
import { addSemester, getSemesterById } from "../src/services/semester.services.js";
import { addCourse } from "../src/services/course.service.js";

const enabled = process.env.RUN_DB_TESTS === "1";

test(
  "database ownership, uniqueness, cascade, and transactional GPA",
  { skip: !enabled },
  async () => {
    const marker = randomUUID();
    const first = await prisma.user.create({
      data: { name: "Integration A", email: `${marker}-a@test.invalid`, password: "unused" },
    });
    const second = await prisma.user.create({
      data: { name: "Integration B", email: `${marker}-b@test.invalid`, password: "unused" },
    });

    try {
      const attempts = await Promise.allSettled([
        addSemester({ year: 2026, term: "Term 1", term_no: 1, is_complete: false, user_id: first.id }),
        addSemester({ year: 2026, term: "Term 1", term_no: 1, is_complete: false, user_id: first.id }),
      ]);
      assert.equal(attempts.filter((item) => item.status === "fulfilled").length, 1);
      const semester = await prisma.semester.findFirstOrThrow({ where: { user_id: first.id } });

      await assert.rejects(() => getSemesterById(second.id, { id: semester.id }));
      await addCourse(first.id, {
        name: "Actual A",
        grade: "A",
        credit: 3,
        type: "ACTUAL",
        semester_id: semester.id,
        category: "MAJOR_REQUIRED",
      });
      await addCourse(first.id, {
        name: "Planned B",
        grade: "B",
        credit: 3,
        type: "PLAN",
        semester_id: semester.id,
        category: "MAJOR_REQUIRED",
      });

      const gpa = await prisma.gPA.findUniqueOrThrow({
        where: { user_id_semester_id: { user_id: first.id, semester_id: semester.id } },
      });
      assert.equal(gpa.gpa, 4);
      assert.equal(gpa.projected_gpa, 3.5);

      await prisma.user.delete({ where: { id: first.id } });
      assert.equal(await prisma.semester.count({ where: { user_id: first.id } }), 0);
      assert.equal(await prisma.course.count({ where: { semester_id: semester.id } }), 0);
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: [first.id, second.id] } } });
      await prisma.$disconnect();
    }
  },
);
