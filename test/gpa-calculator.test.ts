import assert from "node:assert/strict";
import test from "node:test";
import { calculateSemesterMetrics } from "../src/utils/gpa-calculator.js";

test("actual GPA excludes planned courses while projected GPA includes them", () => {
  const result = calculateSemesterMetrics([
    { type: "ACTUAL", credit: 3, grade_point: 4 },
    { type: "PLAN", credit: 3, grade_point: 3 },
  ]);

  assert.deepEqual(result, {
    actualCredits: 3,
    actualPoints: 12,
    actualGpa: 4,
    projectedCredits: 6,
    projectedPoints: 21,
    projectedGpa: 3.5,
  });
});

test("empty and planned-only semesters have a zero actual GPA", () => {
  assert.equal(calculateSemesterMetrics([]).actualGpa, 0);
  const plannedOnly = calculateSemesterMetrics([
    { type: "PLAN", credit: 2, grade_point: 3.5 },
  ]);
  assert.equal(plannedOnly.actualGpa, 0);
  assert.equal(plannedOnly.projectedGpa, 3.5);
});
