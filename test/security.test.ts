import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllowedOrigins,
  getTrustProxy,
  isOriginAllowed,
} from "../src/config/http.js";
import {
  resetPasswordSchema,
  verifyOtpSchema,
} from "../src/utils/auth.validator.js";
import { updateCourseSchema } from "../src/utils/course.validator.js";
import { updateGoalSchema } from "../src/utils/goal.validator.js";
import { updateSemesterSchema } from "../src/utils/semester.validator.js";
import { meetingSchema, taskSchema } from "../src/utils/planner.validator.js";

test("production CORS accepts only configured origins and non-browser clients", () => {
  const allowed = getAllowedOrigins("https://planner.example.com");

  assert.equal(
    isOriginAllowed("https://planner.example.com", allowed, "production"),
    true,
  );
  assert.equal(
    isOriginAllowed("https://evil.example.com", allowed, "production"),
    false,
  );
  assert.equal(isOriginAllowed(undefined, allowed, "production"), true);
});

test("development CORS remains usable when no origins are configured", () => {
  assert.equal(
    isOriginAllowed("http://localhost:3000", new Set(), "development"),
    true,
  );
});

test("proxy trust rejects the unsafe boolean setting", () => {
  assert.equal(getTrustProxy(undefined), false);
  assert.equal(getTrustProxy("1"), 1);
  assert.deepEqual(getTrustProxy("loopback, 10.0.0.0/8"), [
    "loopback",
    "10.0.0.0/8",
  ]);
  assert.throws(() => getTrustProxy("true"), /trusts arbitrary clients/);
});

test("password reset requires a strong password and correctly shaped token", () => {
  assert.equal(
    resetPasswordSchema.safeParse({
      token: "a".repeat(64),
      newPassword: "correct-horse",
    }).success,
    true,
  );
  assert.equal(
    resetPasswordSchema.safeParse({
      token: "not-a-token",
      newPassword: "short",
    }).success,
    false,
  );
});

test("OTP validation accepts exactly six digits", () => {
  const base = {
    email: "student@example.com",
    purpose: "reset_password",
  };

  assert.equal(verifyOtpSchema.safeParse({ ...base, otp: "123456" }).success, true);
  assert.equal(verifyOtpSchema.safeParse({ ...base, otp: "12345x" }).success, false);
});

test("mutation schemas reject empty and unknown-only updates", () => {
  for (const schema of [
    updateCourseSchema,
    updateSemesterSchema,
    updateGoalSchema,
  ]) {
    assert.equal(schema.safeParse({}).success, false);
    assert.equal(schema.safeParse({ admin: true }).success, false);
  }
});

test("planner validation rejects invalid meetings and accepts UTC task dates", () => {
  assert.equal(
    meetingSchema.safeParse({
      weekday: 1,
      start_minute: 600,
      end_minute: 540,
    }).success,
    false,
  );
  assert.equal(
    taskSchema.safeParse({
      title: "Final exam",
      type: "EXAM",
      due_at: "2026-12-01T02:00:00.000Z",
    }).success,
    true,
  );
});
