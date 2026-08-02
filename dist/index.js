// src/index.ts
import "dotenv/config";

// src/config/env.ts
import { z } from "zod";
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ACCESS_SECRET_KEY: z.string().min(32, "ACCESS_SECRET_KEY must be at least 32 characters"),
  REFRESH_SECRET_KEY: z.string().min(32, "REFRESH_SECRET_KEY must be at least 32 characters"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z.string().default("0"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  WEB_PUSH_VAPID_PUBLIC_KEY: z.string().min(20).optional(),
  WEB_PUSH_VAPID_PRIVATE_KEY: z.string().min(20).optional(),
  WEB_PUSH_SUBJECT: z.string().default("mailto:support@example.com")
});
var parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`Invalid environment configuration: ${details}`);
}
var env = parsed.data;

// src/app.ts
import express, {
  urlencoded
} from "express";
import cors from "cors";
import helmet from "helmet";

// src/routes/routes.ts
import { Router as Router9 } from "express";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/controllers/auth.controller.ts
import createHttpError4 from "http-errors";

// src/services/auth.services.ts
import "http-errors";

// src/repositories/auth.repo.ts
import createHttpError from "http-errors";

// src/config/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.6.0",
  "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Grade {\n  A\n  B_PLUS\n  B\n  C_PLUS\n  C\n  D_PLUS\n  D\n  F\n}\n\nenum Plan {\n  PLAN\n  ACTUAL\n}\n\nenum CourseType {\n  GEN_ED\n  MAJOR_REQUIRED\n  MAJOR_ELECTIVE\n  MINOR\n  FREE_ELECTIVE\n}\n\nenum AcademicTaskType {\n  ASSIGNMENT\n  EXAM\n  QUIZ\n  PROJECT\n  OTHER\n}\n\nenum NotificationDeliveryStatus {\n  PENDING\n  CLAIMED\n  SENT\n  FAILED\n}\n\nmodel User {\n  id         String   @id @default(uuid())\n  name       String\n  password   String\n  email      String   @unique\n  created_at DateTime @default(now())\n\n  goals                 Goal[]\n  semesters             Semester[]\n  gpa                   GPA[]\n  chat_logs             ChatLog[]\n  password_reset_tokens PasswordResetToken[]\n  refresh_sessions      RefreshSession[]\n  degree_requirements   DegreeRequirement[]\n  import_operations     ImportOperation[]\n  push_subscriptions    PushSubscription[]\n}\n\nmodel Semester {\n  id          String   @id @default(uuid())\n  year        Int\n  term        String\n  term_no     Int\n  is_complete Boolean\n  created_at  DateTime @default(now())\n\n  user_id String\n  user    User   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  courses Course[]\n  gpas    GPA[]\n  goals   Goal[]\n\n  @@unique([year, term_no, user_id])\n  @@index([user_id])\n}\n\nmodel Course {\n  id          String     @id @default(uuid())\n  name        String\n  category    CourseType\n  grade       Grade\n  grade_point Float\n  credit      Int\n  type        Plan\n  created_at  DateTime   @default(now())\n  course_code String?\n  instructor  String?\n  notes       String?\n\n  semester_id String\n  semester    Semester @relation(fields: [semester_id], references: [id], onDelete: Cascade)\n\n  requirement_id   String?\n  requirement      DegreeRequirement?   @relation(fields: [requirement_id], references: [id], onDelete: SetNull)\n  meetings         CourseMeeting[]\n  tasks            AcademicTask[]\n  prerequisites    CoursePrerequisite[] @relation("CoursePrerequisites")\n  prerequisite_for CoursePrerequisite[] @relation("RequiredCourse")\n\n  @@index([semester_id])\n  @@index([requirement_id])\n}\n\nmodel CourseMeeting {\n  id           String  @id @default(uuid())\n  weekday      Int\n  start_minute Int\n  end_minute   Int\n  location     String?\n  course_id    String\n  course       Course  @relation(fields: [course_id], references: [id], onDelete: Cascade)\n\n  @@index([course_id])\n}\n\nmodel AcademicTask {\n  id                      String                 @id @default(uuid())\n  title                   String\n  type                    AcademicTaskType\n  due_at                  DateTime\n  notes                   String?\n  is_complete             Boolean                @default(false)\n  reminder_offset_minutes Int?                   @default(1440)\n  created_at              DateTime               @default(now())\n  course_id               String\n  course                  Course                 @relation(fields: [course_id], references: [id], onDelete: Cascade)\n  notification_deliveries NotificationDelivery[]\n\n  @@index([course_id])\n  @@index([due_at])\n}\n\nmodel PushSubscription {\n  id         String                 @id @default(uuid())\n  endpoint   String                 @unique\n  p256dh     String\n  auth       String\n  user_agent String?\n  created_at DateTime               @default(now())\n  updated_at DateTime               @updatedAt\n  user_id    String\n  user       User                   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  deliveries NotificationDelivery[]\n\n  @@index([user_id])\n}\n\nmodel NotificationDelivery {\n  id              String                     @id @default(uuid())\n  scheduled_for   DateTime\n  status          NotificationDeliveryStatus @default(PENDING)\n  attempts        Int                        @default(0)\n  available_at    DateTime                   @default(now())\n  claimed_at      DateTime?\n  sent_at         DateTime?\n  last_error      String?\n  created_at      DateTime                   @default(now())\n  updated_at      DateTime                   @updatedAt\n  task_id         String\n  task            AcademicTask               @relation(fields: [task_id], references: [id], onDelete: Cascade)\n  subscription_id String\n  subscription    PushSubscription           @relation(fields: [subscription_id], references: [id], onDelete: Cascade)\n\n  @@unique([task_id, subscription_id, scheduled_for])\n  @@index([status, available_at, scheduled_for])\n  @@index([subscription_id])\n}\n\nmodel CoursePrerequisite {\n  course_id       String\n  prerequisite_id String\n  course          Course @relation("CoursePrerequisites", fields: [course_id], references: [id], onDelete: Cascade)\n  prerequisite    Course @relation("RequiredCourse", fields: [prerequisite_id], references: [id], onDelete: Cascade)\n\n  @@id([course_id, prerequisite_id])\n  @@index([prerequisite_id])\n}\n\nmodel DegreeRequirement {\n  id               String   @id @default(uuid())\n  name             String\n  required_credits Int\n  color            String?\n  sort_order       Int      @default(0)\n  created_at       DateTime @default(now())\n  user_id          String\n  user             User     @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  courses          Course[]\n\n  @@index([user_id])\n}\n\nmodel GPA {\n  user_id                      String\n  semester_id                  String\n  gpa                          Float\n  cum_gpa                      Float\n  total_credits                Int\n  total_grade_points           Float\n  projected_gpa                Float    @default(0)\n  projected_total_credits      Int      @default(0)\n  projected_total_grade_points Float    @default(0)\n  calculated_at                DateTime @default(now())\n\n  user     User     @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  semester Semester @relation(fields: [semester_id], references: [id], onDelete: Cascade)\n\n  @@id([user_id, semester_id])\n  @@index([user_id])\n  @@index([semester_id])\n}\n\nmodel Goal {\n  id                 String   @id @default(uuid())\n  name               String   @default("")\n  target_gpa         Float\n  is_achieved        Boolean  @default(false)\n  target_semester_id String\n  target_semester    Semester @relation(fields: [target_semester_id], references: [id], onDelete: Cascade)\n  user_id            String\n  user               User     @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n  @@index([target_semester_id])\n}\n\nmodel ChatLog {\n  id          String   @id @default(uuid())\n  input_data  String\n  ai_response String\n  context     String?\n  created_at  DateTime @default(now())\n\n  user_id String\n  user    User   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n}\n\nenum OtpPurpose {\n  reset_password\n}\n\nmodel Otp {\n  id         String     @id @default(uuid())\n  email      String\n  otp        String\n  purpose    OtpPurpose\n  attempts   Int        @default(0)\n  expires_at DateTime\n  created_at DateTime   @default(now())\n\n  @@unique([email, purpose])\n  @@index([email])\n  @@index([expires_at])\n}\n\nmodel PasswordResetToken {\n  id         String   @id @default(uuid())\n  token      String   @unique\n  expires_at DateTime\n  created_at DateTime @default(now())\n\n  user_id String\n  user    User   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n  @@index([expires_at])\n}\n\nmodel RefreshSession {\n  id           String    @id @default(uuid())\n  token_hash   String    @unique\n  family_id    String\n  device_info  String?\n  ip_address   String?\n  expires_at   DateTime\n  last_used_at DateTime  @default(now())\n  revoked_at   DateTime?\n  created_at   DateTime  @default(now())\n\n  user_id String\n  user    User   @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n  @@index([family_id])\n  @@index([expires_at])\n}\n\nmodel ImportOperation {\n  id         String   @id @default(uuid())\n  key        String\n  response   Json\n  created_at DateTime @default(now())\n  user_id    String\n  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@unique([user_id, key])\n  @@index([created_at])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"goals","kind":"object","type":"Goal","relationName":"GoalToUser"},{"name":"semesters","kind":"object","type":"Semester","relationName":"SemesterToUser"},{"name":"gpa","kind":"object","type":"GPA","relationName":"GPAToUser"},{"name":"chat_logs","kind":"object","type":"ChatLog","relationName":"ChatLogToUser"},{"name":"password_reset_tokens","kind":"object","type":"PasswordResetToken","relationName":"PasswordResetTokenToUser"},{"name":"refresh_sessions","kind":"object","type":"RefreshSession","relationName":"RefreshSessionToUser"},{"name":"degree_requirements","kind":"object","type":"DegreeRequirement","relationName":"DegreeRequirementToUser"},{"name":"import_operations","kind":"object","type":"ImportOperation","relationName":"ImportOperationToUser"},{"name":"push_subscriptions","kind":"object","type":"PushSubscription","relationName":"PushSubscriptionToUser"}],"dbName":null},"Semester":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"year","kind":"scalar","type":"Int"},{"name":"term","kind":"scalar","type":"String"},{"name":"term_no","kind":"scalar","type":"Int"},{"name":"is_complete","kind":"scalar","type":"Boolean"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SemesterToUser"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToSemester"},{"name":"gpas","kind":"object","type":"GPA","relationName":"GPAToSemester"},{"name":"goals","kind":"object","type":"Goal","relationName":"GoalToSemester"}],"dbName":null},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"category","kind":"enum","type":"CourseType"},{"name":"grade","kind":"enum","type":"Grade"},{"name":"grade_point","kind":"scalar","type":"Float"},{"name":"credit","kind":"scalar","type":"Int"},{"name":"type","kind":"enum","type":"Plan"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"course_code","kind":"scalar","type":"String"},{"name":"instructor","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"semester_id","kind":"scalar","type":"String"},{"name":"semester","kind":"object","type":"Semester","relationName":"CourseToSemester"},{"name":"requirement_id","kind":"scalar","type":"String"},{"name":"requirement","kind":"object","type":"DegreeRequirement","relationName":"CourseToDegreeRequirement"},{"name":"meetings","kind":"object","type":"CourseMeeting","relationName":"CourseToCourseMeeting"},{"name":"tasks","kind":"object","type":"AcademicTask","relationName":"AcademicTaskToCourse"},{"name":"prerequisites","kind":"object","type":"CoursePrerequisite","relationName":"CoursePrerequisites"},{"name":"prerequisite_for","kind":"object","type":"CoursePrerequisite","relationName":"RequiredCourse"}],"dbName":null},"CourseMeeting":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"weekday","kind":"scalar","type":"Int"},{"name":"start_minute","kind":"scalar","type":"Int"},{"name":"end_minute","kind":"scalar","type":"Int"},{"name":"location","kind":"scalar","type":"String"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseMeeting"}],"dbName":null},"AcademicTask":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"AcademicTaskType"},{"name":"due_at","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"is_complete","kind":"scalar","type":"Boolean"},{"name":"reminder_offset_minutes","kind":"scalar","type":"Int"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"course_id","kind":"scalar","type":"String"},{"name":"course","kind":"object","type":"Course","relationName":"AcademicTaskToCourse"},{"name":"notification_deliveries","kind":"object","type":"NotificationDelivery","relationName":"AcademicTaskToNotificationDelivery"}],"dbName":null},"PushSubscription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"endpoint","kind":"scalar","type":"String"},{"name":"p256dh","kind":"scalar","type":"String"},{"name":"auth","kind":"scalar","type":"String"},{"name":"user_agent","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PushSubscriptionToUser"},{"name":"deliveries","kind":"object","type":"NotificationDelivery","relationName":"NotificationDeliveryToPushSubscription"}],"dbName":null},"NotificationDelivery":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"scheduled_for","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"NotificationDeliveryStatus"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"available_at","kind":"scalar","type":"DateTime"},{"name":"claimed_at","kind":"scalar","type":"DateTime"},{"name":"sent_at","kind":"scalar","type":"DateTime"},{"name":"last_error","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"task_id","kind":"scalar","type":"String"},{"name":"task","kind":"object","type":"AcademicTask","relationName":"AcademicTaskToNotificationDelivery"},{"name":"subscription_id","kind":"scalar","type":"String"},{"name":"subscription","kind":"object","type":"PushSubscription","relationName":"NotificationDeliveryToPushSubscription"}],"dbName":null},"CoursePrerequisite":{"fields":[{"name":"course_id","kind":"scalar","type":"String"},{"name":"prerequisite_id","kind":"scalar","type":"String"},{"name":"course","kind":"object","type":"Course","relationName":"CoursePrerequisites"},{"name":"prerequisite","kind":"object","type":"Course","relationName":"RequiredCourse"}],"dbName":null},"DegreeRequirement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"required_credits","kind":"scalar","type":"Int"},{"name":"color","kind":"scalar","type":"String"},{"name":"sort_order","kind":"scalar","type":"Int"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"DegreeRequirementToUser"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToDegreeRequirement"}],"dbName":null},"GPA":{"fields":[{"name":"user_id","kind":"scalar","type":"String"},{"name":"semester_id","kind":"scalar","type":"String"},{"name":"gpa","kind":"scalar","type":"Float"},{"name":"cum_gpa","kind":"scalar","type":"Float"},{"name":"total_credits","kind":"scalar","type":"Int"},{"name":"total_grade_points","kind":"scalar","type":"Float"},{"name":"projected_gpa","kind":"scalar","type":"Float"},{"name":"projected_total_credits","kind":"scalar","type":"Int"},{"name":"projected_total_grade_points","kind":"scalar","type":"Float"},{"name":"calculated_at","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"GPAToUser"},{"name":"semester","kind":"object","type":"Semester","relationName":"GPAToSemester"}],"dbName":null},"Goal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"target_gpa","kind":"scalar","type":"Float"},{"name":"is_achieved","kind":"scalar","type":"Boolean"},{"name":"target_semester_id","kind":"scalar","type":"String"},{"name":"target_semester","kind":"object","type":"Semester","relationName":"GoalToSemester"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"GoalToUser"}],"dbName":null},"ChatLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"input_data","kind":"scalar","type":"String"},{"name":"ai_response","kind":"scalar","type":"String"},{"name":"context","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ChatLogToUser"}],"dbName":null},"Otp":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"otp","kind":"scalar","type":"String"},{"name":"purpose","kind":"enum","type":"OtpPurpose"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"expires_at","kind":"scalar","type":"DateTime"},{"name":"created_at","kind":"scalar","type":"DateTime"}],"dbName":null},"PasswordResetToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expires_at","kind":"scalar","type":"DateTime"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PasswordResetTokenToUser"}],"dbName":null},"RefreshSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token_hash","kind":"scalar","type":"String"},{"name":"family_id","kind":"scalar","type":"String"},{"name":"device_info","kind":"scalar","type":"String"},{"name":"ip_address","kind":"scalar","type":"String"},{"name":"expires_at","kind":"scalar","type":"DateTime"},{"name":"last_used_at","kind":"scalar","type":"DateTime"},{"name":"revoked_at","kind":"scalar","type":"DateTime"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"RefreshSessionToUser"}],"dbName":null},"ImportOperation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"key","kind":"scalar","type":"String"},{"name":"response","kind":"scalar","type":"Json"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ImportOperationToUser"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","semester","courses","_count","requirement","course","meetings","task","deliveries","subscription","notification_deliveries","tasks","prerequisite","prerequisites","prerequisite_for","gpas","goals","target_semester","semesters","gpa","chat_logs","password_reset_tokens","refresh_sessions","degree_requirements","import_operations","push_subscriptions","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Semester.findUnique","Semester.findUniqueOrThrow","Semester.findFirst","Semester.findFirstOrThrow","Semester.findMany","Semester.createOne","Semester.createMany","Semester.createManyAndReturn","Semester.updateOne","Semester.updateMany","Semester.updateManyAndReturn","Semester.upsertOne","Semester.deleteOne","Semester.deleteMany","_avg","_sum","Semester.groupBy","Semester.aggregate","Course.findUnique","Course.findUniqueOrThrow","Course.findFirst","Course.findFirstOrThrow","Course.findMany","Course.createOne","Course.createMany","Course.createManyAndReturn","Course.updateOne","Course.updateMany","Course.updateManyAndReturn","Course.upsertOne","Course.deleteOne","Course.deleteMany","Course.groupBy","Course.aggregate","CourseMeeting.findUnique","CourseMeeting.findUniqueOrThrow","CourseMeeting.findFirst","CourseMeeting.findFirstOrThrow","CourseMeeting.findMany","CourseMeeting.createOne","CourseMeeting.createMany","CourseMeeting.createManyAndReturn","CourseMeeting.updateOne","CourseMeeting.updateMany","CourseMeeting.updateManyAndReturn","CourseMeeting.upsertOne","CourseMeeting.deleteOne","CourseMeeting.deleteMany","CourseMeeting.groupBy","CourseMeeting.aggregate","AcademicTask.findUnique","AcademicTask.findUniqueOrThrow","AcademicTask.findFirst","AcademicTask.findFirstOrThrow","AcademicTask.findMany","AcademicTask.createOne","AcademicTask.createMany","AcademicTask.createManyAndReturn","AcademicTask.updateOne","AcademicTask.updateMany","AcademicTask.updateManyAndReturn","AcademicTask.upsertOne","AcademicTask.deleteOne","AcademicTask.deleteMany","AcademicTask.groupBy","AcademicTask.aggregate","PushSubscription.findUnique","PushSubscription.findUniqueOrThrow","PushSubscription.findFirst","PushSubscription.findFirstOrThrow","PushSubscription.findMany","PushSubscription.createOne","PushSubscription.createMany","PushSubscription.createManyAndReturn","PushSubscription.updateOne","PushSubscription.updateMany","PushSubscription.updateManyAndReturn","PushSubscription.upsertOne","PushSubscription.deleteOne","PushSubscription.deleteMany","PushSubscription.groupBy","PushSubscription.aggregate","NotificationDelivery.findUnique","NotificationDelivery.findUniqueOrThrow","NotificationDelivery.findFirst","NotificationDelivery.findFirstOrThrow","NotificationDelivery.findMany","NotificationDelivery.createOne","NotificationDelivery.createMany","NotificationDelivery.createManyAndReturn","NotificationDelivery.updateOne","NotificationDelivery.updateMany","NotificationDelivery.updateManyAndReturn","NotificationDelivery.upsertOne","NotificationDelivery.deleteOne","NotificationDelivery.deleteMany","NotificationDelivery.groupBy","NotificationDelivery.aggregate","CoursePrerequisite.findUnique","CoursePrerequisite.findUniqueOrThrow","CoursePrerequisite.findFirst","CoursePrerequisite.findFirstOrThrow","CoursePrerequisite.findMany","CoursePrerequisite.createOne","CoursePrerequisite.createMany","CoursePrerequisite.createManyAndReturn","CoursePrerequisite.updateOne","CoursePrerequisite.updateMany","CoursePrerequisite.updateManyAndReturn","CoursePrerequisite.upsertOne","CoursePrerequisite.deleteOne","CoursePrerequisite.deleteMany","CoursePrerequisite.groupBy","CoursePrerequisite.aggregate","DegreeRequirement.findUnique","DegreeRequirement.findUniqueOrThrow","DegreeRequirement.findFirst","DegreeRequirement.findFirstOrThrow","DegreeRequirement.findMany","DegreeRequirement.createOne","DegreeRequirement.createMany","DegreeRequirement.createManyAndReturn","DegreeRequirement.updateOne","DegreeRequirement.updateMany","DegreeRequirement.updateManyAndReturn","DegreeRequirement.upsertOne","DegreeRequirement.deleteOne","DegreeRequirement.deleteMany","DegreeRequirement.groupBy","DegreeRequirement.aggregate","GPA.findUnique","GPA.findUniqueOrThrow","GPA.findFirst","GPA.findFirstOrThrow","GPA.findMany","GPA.createOne","GPA.createMany","GPA.createManyAndReturn","GPA.updateOne","GPA.updateMany","GPA.updateManyAndReturn","GPA.upsertOne","GPA.deleteOne","GPA.deleteMany","GPA.groupBy","GPA.aggregate","Goal.findUnique","Goal.findUniqueOrThrow","Goal.findFirst","Goal.findFirstOrThrow","Goal.findMany","Goal.createOne","Goal.createMany","Goal.createManyAndReturn","Goal.updateOne","Goal.updateMany","Goal.updateManyAndReturn","Goal.upsertOne","Goal.deleteOne","Goal.deleteMany","Goal.groupBy","Goal.aggregate","ChatLog.findUnique","ChatLog.findUniqueOrThrow","ChatLog.findFirst","ChatLog.findFirstOrThrow","ChatLog.findMany","ChatLog.createOne","ChatLog.createMany","ChatLog.createManyAndReturn","ChatLog.updateOne","ChatLog.updateMany","ChatLog.updateManyAndReturn","ChatLog.upsertOne","ChatLog.deleteOne","ChatLog.deleteMany","ChatLog.groupBy","ChatLog.aggregate","Otp.findUnique","Otp.findUniqueOrThrow","Otp.findFirst","Otp.findFirstOrThrow","Otp.findMany","Otp.createOne","Otp.createMany","Otp.createManyAndReturn","Otp.updateOne","Otp.updateMany","Otp.updateManyAndReturn","Otp.upsertOne","Otp.deleteOne","Otp.deleteMany","Otp.groupBy","Otp.aggregate","PasswordResetToken.findUnique","PasswordResetToken.findUniqueOrThrow","PasswordResetToken.findFirst","PasswordResetToken.findFirstOrThrow","PasswordResetToken.findMany","PasswordResetToken.createOne","PasswordResetToken.createMany","PasswordResetToken.createManyAndReturn","PasswordResetToken.updateOne","PasswordResetToken.updateMany","PasswordResetToken.updateManyAndReturn","PasswordResetToken.upsertOne","PasswordResetToken.deleteOne","PasswordResetToken.deleteMany","PasswordResetToken.groupBy","PasswordResetToken.aggregate","RefreshSession.findUnique","RefreshSession.findUniqueOrThrow","RefreshSession.findFirst","RefreshSession.findFirstOrThrow","RefreshSession.findMany","RefreshSession.createOne","RefreshSession.createMany","RefreshSession.createManyAndReturn","RefreshSession.updateOne","RefreshSession.updateMany","RefreshSession.updateManyAndReturn","RefreshSession.upsertOne","RefreshSession.deleteOne","RefreshSession.deleteMany","RefreshSession.groupBy","RefreshSession.aggregate","ImportOperation.findUnique","ImportOperation.findUniqueOrThrow","ImportOperation.findFirst","ImportOperation.findFirstOrThrow","ImportOperation.findMany","ImportOperation.createOne","ImportOperation.createMany","ImportOperation.createManyAndReturn","ImportOperation.updateOne","ImportOperation.updateMany","ImportOperation.updateManyAndReturn","ImportOperation.upsertOne","ImportOperation.deleteOne","ImportOperation.deleteMany","ImportOperation.groupBy","ImportOperation.aggregate","AND","OR","NOT","id","key","response","created_at","user_id","equals","in","notIn","lt","lte","gt","gte","not","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","contains","startsWith","endsWith","token_hash","family_id","device_info","ip_address","expires_at","last_used_at","revoked_at","token","email","otp","OtpPurpose","purpose","attempts","email_purpose","input_data","ai_response","context","name","target_gpa","is_achieved","target_semester_id","semester_id","cum_gpa","total_credits","total_grade_points","projected_gpa","projected_total_credits","projected_total_grade_points","calculated_at","required_credits","color","sort_order","course_id","prerequisite_id","scheduled_for","NotificationDeliveryStatus","status","available_at","claimed_at","sent_at","last_error","updated_at","task_id","subscription_id","endpoint","p256dh","auth","user_agent","title","AcademicTaskType","type","due_at","notes","is_complete","reminder_offset_minutes","weekday","start_minute","end_minute","location","CourseType","category","Grade","grade","grade_point","credit","Plan","course_code","instructor","requirement_id","year","term","term_no","password","every","some","none","user_id_key","year_term_no_user_id","user_id_semester_id","course_id_prerequisite_id","task_id_subscription_id_scheduled_for","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "pwiZAYACERMAAP4DACAVAAD_AwAgFgAAgAQAIBcAAIEEACAYAACCBAAgGQAAgwQAIBoAAIQEACAbAACFBAAgHAAAhgQAIKUCAAD9AwAwpgIAAFUAEKcCAAD9AwAwqAIBAAAAAasCQADYAwAhxgIBAAAAAc8CAQDVAwAhhgMBANUDACEBAAAAAQAgCwMAAIkEACAUAACaBAAgpQIAAK8EADCmAgAAAwAQpwIAAK8EADCoAgEA1QMAIawCAQDVAwAhzwIBANUDACHQAggAmQQAIdECIACWBAAh0gIBANUDACECAwAAqwcAIBQAAK4HACALAwAAiQQAIBQAAJoEACClAgAArwQAMKYCAAADABCnAgAArwQAMKgCAQAAAAGsAgEA1QMAIc8CAQDVAwAh0AIIAJkEACHRAiAAlgQAIdICAQDVAwAhAwAAAAMAIAEAAAQAMAIAAAUAIBYEAACaBAAgBwAAqwQAIAkAAKwEACAOAACtBAAgEAAArgQAIBEAAK4EACClAgAApwQAMKYCAAAHABCnAgAApwQAMKgCAQDVAwAhqwJAANgDACHPAgEA1QMAIdMCAQDVAwAh8AIAAKoEgAMi8gIBAIgEACH6AgAAqAT6AiL8AgAAqQT8AiL9AggAmQQAIf4CAgDXAwAhgAMBAIgEACGBAwEAiAQAIYIDAQCIBAAhCgQAAK4HACAHAACyBwAgCQAAswcAIA4AALQHACAQAAC1BwAgEQAAtQcAIPICAAC3BAAggAMAALcEACCBAwAAtwQAIIIDAAC3BAAgFgQAAJoEACAHAACrBAAgCQAArAQAIA4AAK0EACAQAACuBAAgEQAArgQAIKUCAACnBAAwpgIAAAcAEKcCAACnBAAwqAIBAAAAAasCQADYAwAhzwIBANUDACHTAgEA1QMAIfACAACqBIADIvICAQCIBAAh-gIAAKgE-gIi_AIAAKkE_AIi_QIIAJkEACH-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_gMAIKUCAACVBAAwpgIAAC8AEKcCAACVBAAwqAIBAAAAAasCQADYAwAhrAIBANUDACHzAiAAlgQAIYMDAgDXAwAhhAMBANUDACGFAwIA1wMAIYsDAACUBAAgAwAAAC8AIAEAADAAMAIAADEAIAMAAAAnACABAAAoADACAAApACAKAwAAiQQAIKUCAACTBAAwpgIAADQAEKcCAACTBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhzAIBANUDACHNAgEA1QMAIc4CAQCIBAAhAgMAAKsHACDOAgAAtwQAIAoDAACJBAAgpQIAAJMEADCmAgAANAAQpwIAAJMEADCoAgEAAAABqwJAANgDACGsAgEA1QMAIcwCAQDVAwAhzQIBANUDACHOAgEAiAQAIQMAAAA0ACABAAA1ADACAAA2ACAJAwAAiQQAIKUCAACSBAAwpgIAADgAEKcCAACSBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhwgJAANgDACHFAgEA1QMAIQEDAACrBwAgCQMAAIkEACClAgAAkgQAMKYCAAA4ABCnAgAAkgQAMKgCAQAAAAGrAkAA2AMAIawCAQDVAwAhwgJAANgDACHFAgEAAAABAwAAADgAIAEAADkAMAIAADoAIA4DAACJBAAgpQIAAJAEADCmAgAAPAAQpwIAAJAEADCoAgEA1QMAIasCQADYAwAhrAIBANUDACG-AgEA1QMAIb8CAQDVAwAhwAIBAIgEACHBAgEAiAQAIcICQADYAwAhwwJAANgDACHEAkAAkQQAIQQDAACrBwAgwAIAALcEACDBAgAAtwQAIMQCAAC3BAAgDgMAAIkEACClAgAAkAQAMKYCAAA8ABCnAgAAkAQAMKgCAQAAAAGrAkAA2AMAIawCAQDVAwAhvgIBAAAAAb8CAQDVAwAhwAIBAIgEACHBAgEAiAQAIcICQADYAwAhwwJAANgDACHEAkAAkQQAIQMAAAA8ACABAAA9ADACAAA-ACADAwAAqwcAIAUAAK0HACDcAgAAtwQAIAwDAACJBAAgBQAAjwQAIKUCAACOBAAwpgIAAAsAEKcCAACOBAAwqAIBAAAAAasCQADYAwAhrAIBANUDACHPAgEA1QMAIdsCAgDXAwAh3AIBAIgEACHdAgIA1wMAIQMAAAALACABAABAADACAABBACAJAwAAiQQAIKUCAACMBAAwpgIAAEMAEKcCAACMBAAwqAIBANUDACGpAgEA1QMAIaoCAACNBAAgqwJAANgDACGsAgEA1QMAIQEDAACrBwAgCgMAAIkEACClAgAAjAQAMKYCAABDABCnAgAAjAQAMKgCAQAAAAGpAgEA1QMAIaoCAACNBAAgqwJAANgDACGsAgEA1QMAIYoDAACLBAAgAwAAAEMAIAEAAEQAMAIAAEUAIA0DAACJBAAgCwAAigQAIKUCAACHBAAwpgIAAEcAEKcCAACHBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAh5wJAANgDACHqAgEA1QMAIesCAQDVAwAh7AIBANUDACHtAgEAiAQAIQMDAACrBwAgCwAArAcAIO0CAAC3BAAgDQMAAIkEACALAACKBAAgpQIAAIcEADCmAgAARwAQpwIAAIcEADCoAgEAAAABqwJAANgDACGsAgEA1QMAIecCQADYAwAh6gIBAAAAAesCAQDVAwAh7AIBANUDACHtAgEAiAQAIQMAAABHACABAABIADACAABJACABAAAAAwAgAQAAAC8AIAEAAAAnACABAAAANAAgAQAAADgAIAEAAAA8ACABAAAACwAgAQAAAEMAIAEAAABHACABAAAAAQAgERMAAP4DACAVAAD_AwAgFgAAgAQAIBcAAIEEACAYAACCBAAgGQAAgwQAIBoAAIQEACAbAACFBAAgHAAAhgQAIKUCAAD9AwAwpgIAAFUAEKcCAAD9AwAwqAIBANUDACGrAkAA2AMAIcYCAQDVAwAhzwIBANUDACGGAwEA1QMAIQkTAACiBwAgFQAAowcAIBYAAKQHACAXAAClBwAgGAAApgcAIBkAAKcHACAaAACoBwAgGwAAqQcAIBwAAKoHACADAAAAVQAgAQAAVgAwAgAAAQAgAwAAAFUAIAEAAFYAMAIAAAEAIAMAAABVACABAABWADACAAABACAOEwAAmQcAIBUAAJoHACAWAACbBwAgFwAAnAcAIBgAAJ0HACAZAACeBwAgGgAAnwcAIBsAAKAHACAcAAChBwAgqAIBAAAAAasCQAAAAAHGAgEAAAABzwIBAAAAAYYDAQAAAAEBIgAAWgAgBagCAQAAAAGrAkAAAAABxgIBAAAAAc8CAQAAAAGGAwEAAAABASIAAFwAMAEiAABcADAOEwAAqgYAIBUAAKsGACAWAACsBgAgFwAArQYAIBgAAK4GACAZAACvBgAgGgAAsAYAIBsAALEGACAcAACyBgAgqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQIAAAABACAiAABfACAFqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQIAAABVACAiAABhACACAAAAVQAgIgAAYQAgAwAAAAEAICkAAFoAICoAAF8AIAEAAAABACABAAAAVQAgAwYAAKcGACAvAACpBgAgMAAAqAYAIAilAgAA_AMAMKYCAABoABCnAgAA_AMAMKgCAQC7AwAhqwJAAL0DACHGAgEAuwMAIc8CAQC7AwAhhgMBALsDACEDAAAAVQAgAQAAZwAwLgAAaAAgAwAAAFUAIAEAAFYAMAIAAAEAIAEAAAAxACABAAAAMQAgAwAAAC8AIAEAADAAMAIAADEAIAMAAAAvACABAAAwADACAAAxACADAAAALwAgAQAAMAAwAgAAMQAgCwMAAKMGACAFAACkBgAgEgAApQYAIBMAAKYGACCoAgEAAAABqwJAAAAAAawCAQAAAAHzAiAAAAABgwMCAAAAAYQDAQAAAAGFAwIAAAABASIAAHAAIAeoAgEAAAABqwJAAAAAAawCAQAAAAHzAiAAAAABgwMCAAAAAYQDAQAAAAGFAwIAAAABASIAAHIAMAEiAAByADALAwAA_gUAIAUAAP8FACASAACABgAgEwAAgQYAIKgCAQCzBAAhqwJAALQEACGsAgEAswQAIfMCIADWBAAhgwMCAMoEACGEAwEAswQAIYUDAgDKBAAhAgAAADEAICIAAHUAIAeoAgEAswQAIasCQAC0BAAhrAIBALMEACHzAiAA1gQAIYMDAgDKBAAhhAMBALMEACGFAwIAygQAIQIAAAAvACAiAAB3ACACAAAALwAgIgAAdwAgAwAAADEAICkAAHAAICoAAHUAIAEAAAAxACABAAAALwAgBQYAAPkFACAvAAD8BQAgMAAA-wUAIEEAAPoFACBCAAD9BQAgCqUCAAD7AwAwpgIAAH4AEKcCAAD7AwAwqAIBALsDACGrAkAAvQMAIawCAQC7AwAh8wIgAN0DACGDAwIAzwMAIYQDAQC7AwAhhQMCAM8DACEDAAAALwAgAQAAfQAwLgAAfgAgAwAAAC8AIAEAADAAMAIAADEAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgEwQAAMMFACAHAAD4BQAgCQAAxAUAIA4AAMUFACAQAADGBQAgEQAAxwUAIKgCAQAAAAGrAkAAAAABzwIBAAAAAdMCAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAYIDAQAAAAEBIgAAhgEAIA2oAgEAAAABqwJAAAAAAc8CAQAAAAHTAgEAAAAB8AIAAACAAwLyAgEAAAAB-gIAAAD6AgL8AgAAAPwCAv0CCAAAAAH-AgIAAAABgAMBAAAAAYEDAQAAAAGCAwEAAAABASIAAIgBADABIgAAiAEAMAEAAAALACATBAAA-QQAIAcAAPcFACAJAAD6BAAgDgAA-wQAIBAAAPwEACARAAD9BAAgqAIBALMEACGrAkAAtAQAIc8CAQCzBAAh0wIBALMEACHwAgAA9wSAAyLyAgEAuwQAIfoCAAD1BPoCIvwCAAD2BPwCIv0CCADVBAAh_gICAMoEACGAAwEAuwQAIYEDAQC7BAAhggMBALsEACECAAAACQAgIgAAjAEAIA2oAgEAswQAIasCQAC0BAAhzwIBALMEACHTAgEAswQAIfACAAD3BIADIvICAQC7BAAh-gIAAPUE-gIi_AIAAPYE_AIi_QIIANUEACH-AgIAygQAIYADAQC7BAAhgQMBALsEACGCAwEAuwQAIQIAAAAHACAiAACOAQAgAgAAAAcAICIAAI4BACABAAAACwAgAwAAAAkAICkAAIYBACAqAACMAQAgAQAAAAkAIAEAAAAHACAJBgAA8gUAIC8AAPUFACAwAAD0BQAgQQAA8wUAIEIAAPYFACDyAgAAtwQAIIADAAC3BAAggQMAALcEACCCAwAAtwQAIBClAgAA8QMAMKYCAACWAQAQpwIAAPEDADCoAgEAuwMAIasCQAC9AwAhzwIBALsDACHTAgEAuwMAIfACAAD0A4ADIvICAQDFAwAh-gIAAPID-gIi_AIAAPMD_AIi_QIIANwDACH-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AgQQAA5QQAIEIAAOgEACDcAgAAtwQAIAqlAgAA4gMAMKYCAACaAgAQpwIAAOIDADCoAgEAuwMAIasCQAC9AwAhrAIBALsDACHPAgEAuwMAIdsCAgDPAwAh3AIBAMUDACHdAgIAzwMAIQMAAAALACABAACZAgAwLgAAmgIAIAMAAAALACABAABAADACAABBACABAAAAKQAgAQAAACkAIAMAAAAnACABAAAoADACAAApACADAAAAJwAgAQAAKAAwAgAAKQAgAwAAACcAIAEAACgAMAIAACkAIAwDAADiBAAgBAAA4wQAIBYIAAAAAawCAQAAAAHTAgEAAAAB1AIIAAAAAdUCAgAAAAHWAggAAAAB1wIIAAAAAdgCAgAAAAHZAggAAAAB2gJAAAAAAQEiAACiAgAgChYIAAAAAawCAQAAAAHTAgEAAAAB1AIIAAAAAdUCAgAAAAHWAggAAAAB1wIIAAAAAdgCAgAAAAHZAggAAAAB2gJAAAAAAQEiAACkAgAwASIAAKQCADAMAwAA4AQAIAQAAOEEACAWCADVBAAhrAIBALMEACHTAgEAswQAIdQCCADVBAAh1QICAMoEACHWAggA1QQAIdcCCADVBAAh2AICAMoEACHZAggA1QQAIdoCQAC0BAAhAgAAACkAICIAAKcCACAKFggA1QQAIawCAQCzBAAh0wIBALMEACHUAggA1QQAIdUCAgDKBAAh1gIIANUEACHXAggA1QQAIdgCAgDKBAAh2QIIANUEACHaAkAAtAQAIQIAAAAnACAiAACpAgAgAgAAACcAICIAAKkCACADAAAAKQAgKQAAogIAICoAAKcCACABAAAAKQAgAQAAACcAIAUGAADbBAAgLwAA3gQAIDAAAN0EACBBAADcBAAgQgAA3wQAIA0WCADcAwAhpQIAAOEDADCmAgAAsAIAEKcCAADhAwAwrAIBALsDACHTAgEAuwMAIdQCCADcAwAh1QICAM8DACHWAggA3AMAIdcCCADcAwAh2AICAM8DACHZAggA3AMAIdoCQAC9AwAhAwAAACcAIAEAAK8CADAuAACwAgAgAwAAACcAIAEAACgAMAIAACkAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCAMAANoEACAUAADZBAAgqAIBAAAAAawCAQAAAAHPAgEAAAAB0AIIAAAAAdECIAAAAAHSAgEAAAABASIAALgCACAGqAIBAAAAAawCAQAAAAHPAgEAAAAB0AIIAAAAAdECIAAAAAHSAgEAAAABASIAALoCADABIgAAugIAMAgDAADYBAAgFAAA1wQAIKgCAQCzBAAhrAIBALMEACHPAgEAswQAIdACCADVBAAh0QIgANYEACHSAgEAswQAIQIAAAAFACAiAAC9AgAgBqgCAQCzBAAhrAIBALMEACHPAgEAswQAIdACCADVBAAh0QIgANYEACHSAgEAswQAIQIAAAADACAiAAC_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_wIAMAEiAAD_AgAwBgMAAMIEACCoAgEAswQAIasCQAC0BAAhrAIBALMEACHCAkAAtAQAIcUCAQCzBAAhAgAAADoAICIAAIIDACAFqAIBALMEACGrAkAAtAQAIawCAQCzBAAhwgJAALQEACHFAgEAswQAIQIAAAA4ACAiAACEAwAgAgAAADgAICIAAIQDACADAAAAOgAgKQAA_QIAICoAAIIDACABAAAAOgAgAQAAADgAIAMGAAC_BAAgLwAAwQQAIDAAAMAEACAIpQIAAMwDADCmAgAAiwMAEKcCAADMAwAwqAIBALsDACGrAkAAvQMAIawCAQC7AwAhwgJAAL0DACHFAgEAuwMAIQMAAAA4ACABAACKAwAwLgAAiwMAIAMAAAA4ACABAAA5ADACAAA6ACABAAAAPgAgAQAAAD4AIAMAAAA8ACABAAA9ADACAAA-ACADAAAAPAAgAQAAPQAwAgAAPgAgAwAAADwAIAEAAD0AMAIAAD4AIAsDAAC-BAAgqAIBAAAAAasCQAAAAAGsAgEAAAABvgIBAAAAAb8CAQAAAAHAAgEAAAABwQIBAAAAAcICQAAAAAHDAkAAAAABxAJAAAAAAQEiAACTAwAgCqgCAQAAAAGrAkAAAAABrAIBAAAAAb4CAQAAAAG_AgEAAAABwAIBAAAAAcECAQAAAAHCAkAAAAABwwJAAAAAAcQCQAAAAAEBIgAAlQMAMAEiAACVAwAwCwMAAL0EACCoAgEAswQAIasCQAC0BAAhrAIBALMEACG-AgEAswQAIb8CAQCzBAAhwAIBALsEACHBAgEAuwQAIcICQAC0BAAhwwJAALQEACHEAkAAvAQAIQIAAAA-ACAiAACYAwAgCqgCAQCzBAAhqwJAALQEACGsAgEAswQAIb4CAQCzBAAhvwIBALMEACHAAgEAuwQAIcECAQC7BAAhwgJAALQEACHDAkAAtAQAIcQCQAC8BAAhAgAAADwAICIAAJoDACACAAAAPAAgIgAAmgMAIAMAAAA-ACApAACTAwAgKgAAmAMAIAEAAAA-ACABAAAAPAAgBgYAALgEACAvAAC6BAAgMAAAuQQAIMACAAC3BAAgwQIAALcEACDEAgAAtwQAIA2lAgAAxAMAMKYCAAChAwAQpwIAAMQDADCoAgEAuwMAIasCQAC9AwAhrAIBALsDACG-AgEAuwMAIb8CAQC7AwAhwAIBAMUDACHBAgEAxQMAIcICQAC9AwAhwwJAAL0DACHEAkAAxgMAIQMAAAA8ACABAACgAwAwLgAAoQMAIAMAAAA8ACABAAA9ADACAAA-ACABAAAARQAgAQAAAEUAIAMAAABDACABAABEADACAABFACADAAAAQwAgAQAARAAwAgAARQAgAwAAAEMAIAEAAEQAMAIAAEUAIAYDAAC2BAAgqAIBAAAAAakCAQAAAAGqAoAAAAABqwJAAAAAAawCAQAAAAEBIgAAqQMAIAWoAgEAAAABqQIBAAAAAaoCgAAAAAGrAkAAAAABrAIBAAAAAQEiAACrAwAwASIAAKsDADAGAwAAtQQAIKgCAQCzBAAhqQIBALMEACGqAoAAAAABqwJAALQEACGsAgEAswQAIQIAAABFACAiAACuAwAgBagCAQCzBAAhqQIBALMEACGqAoAAAAABqwJAALQEACGsAgEAswQAIQIAAABDACAiAACwAwAgAgAAAEMAICIAALADACADAAAARQAgKQAAqQMAICoAAK4DACABAAAARQAgAQAAAEMAIAMGAACwBAAgLwAAsgQAIDAAALEEACAIpQIAALoDADCmAgAAtwMAEKcCAAC6AwAwqAIBALsDACGpAgEAuwMAIaoCAAC8AwAgqwJAAL0DACGsAgEAuwMAIQMAAABDACABAAC2AwAwLgAAtwMAIAMAAABDACABAABEADACAABFACAIpQIAALoDADCmAgAAtwMAEKcCAAC6AwAwqAIBALsDACGpAgEAuwMAIaoCAAC8AwAgqwJAAL0DACGsAgEAuwMAIQ4GAAC_AwAgLwAAwwMAIDAAAMMDACCtAgEAAAABrgIBAAAABK8CAQAAAASwAgEAAAABsQIBAAAAAbICAQAAAAGzAgEAAAABtAIBAMIDACG7AgEAAAABvAIBAAAAAb0CAQAAAAEPBgAAvwMAIC8AAMEDACAwAADBAwAgrQKAAAAAAbACgAAAAAGxAoAAAAABsgKAAAAAAbMCgAAAAAG0AoAAAAABtQIBAAAAAbYCAQAAAAG3AgEAAAABuAKAAAAAAbkCgAAAAAG6AoAAAAABCwYAAL8DACAvAADAAwAgMAAAwAMAIK0CQAAAAAGuAkAAAAAErwJAAAAABLACQAAAAAGxAkAAAAABsgJAAAAAAbMCQAAAAAG0AkAAvgMAIQsGAAC_AwAgLwAAwAMAIDAAAMADACCtAkAAAAABrgJAAAAABK8CQAAAAASwAkAAAAABsQJAAAAAAbICQAAAAAGzAkAAAAABtAJAAL4DACEIrQICAAAAAa4CAgAAAASvAgIAAAAEsAICAAAAAbECAgAAAAGyAgIAAAABswICAAAAAbQCAgC_AwAhCK0CQAAAAAGuAkAAAAAErwJAAAAABLACQAAAAAGxAkAAAAABsgJAAAAAAbMCQAAAAAG0AkAAwAMAIQytAoAAAAABsAKAAAAAAbECgAAAAAGyAoAAAAABswKAAAAAAbQCgAAAAAG1AgEAAAABtgIBAAAAAbcCAQAAAAG4AoAAAAABuQKAAAAAAboCgAAAAAEOBgAAvwMAIC8AAMMDACAwAADDAwAgrQIBAAAAAa4CAQAAAASvAgEAAAAEsAIBAAAAAbECAQAAAAGyAgEAAAABswIBAAAAAbQCAQDCAwAhuwIBAAAAAbwCAQAAAAG9AgEAAAABC60CAQAAAAGuAgEAAAAErwIBAAAABLACAQAAAAGxAgEAAAABsgIBAAAAAbMCAQAAAAG0AgEAwwMAIbsCAQAAAAG8AgEAAAABvQIBAAAAAQ2lAgAAxAMAMKYCAAChAwAQpwIAAMQDADCoAgEAuwMAIasCQAC9AwAhrAIBALsDACG-AgEAuwMAIb8CAQC7AwAhwAIBAMUDACHBAgEAxQMAIcICQAC9AwAhwwJAAL0DACHEAkAAxgMAIQ4GAADIAwAgLwAAywMAIDAAAMsDACCtAgEAAAABrgIBAAAABa8CAQAAAAWwAgEAAAABsQIBAAAAAbICAQAAAAGzAgEAAAABtAIBAMoDACG7AgEAAAABvAIBAAAAAb0CAQAAAAELBgAAyAMAIC8AAMkDACAwAADJAwAgrQJAAAAAAa4CQAAAAAWvAkAAAAAFsAJAAAAAAbECQAAAAAGyAkAAAAABswJAAAAAAbQCQADHAwAhCwYAAMgDACAvAADJAwAgMAAAyQMAIK0CQAAAAAGuAkAAAAAFrwJAAAAABbACQAAAAAGxAkAAAAABsgJAAAAAAbMCQAAAAAG0AkAAxwMAIQitAgIAAAABrgICAAAABa8CAgAAAAWwAgIAAAABsQICAAAAAbICAgAAAAGzAgIAAAABtAICAMgDACEIrQJAAAAAAa4CQAAAAAWvAkAAAAAFsAJAAAAAAbECQAAAAAGyAkAAAAABswJAAAAAAbQCQADJAwAhDgYAAMgDACAvAADLAwAgMAAAywMAIK0CAQAAAAGuAgEAAAAFrwIBAAAABbACAQAAAAGxAgEAAAABsgIBAAAAAbMCAQAAAAG0AgEAygMAIbsCAQAAAAG8AgEAAAABvQIBAAAAAQutAgEAAAABrgIBAAAABa8CAQAAAAWwAgEAAAABsQIBAAAAAbICAQAAAAGzAgEAAAABtAIBAMsDACG7AgEAAAABvAIBAAAAAb0CAQAAAAEIpQIAAMwDADCmAgAAiwMAEKcCAADMAwAwqAIBALsDACGrAkAAvQMAIawCAQC7AwAhwgJAAL0DACHFAgEAuwMAIQqlAgAAzQMAMKYCAAD1AgAQpwIAAM0DADCoAgEAuwMAIasCQAC9AwAhwgJAAL0DACHGAgEAuwMAIccCAQC7AwAhyQIAAM4DyQIiygICAM8DACEHBgAAvwMAIC8AANMDACAwAADTAwAgrQIAAADJAgKuAgAAAMkCCK8CAAAAyQIItAIAANIDyQIiDQYAAL8DACAvAAC_AwAgMAAAvwMAIEEAANEDACBCAAC_AwAgrQICAAAAAa4CAgAAAASvAgIAAAAEsAICAAAAAbECAgAAAAGyAgIAAAABswICAAAAAbQCAgDQAwAhDQYAAL8DACAvAAC_AwAgMAAAvwMAIEEAANEDACBCAAC_AwAgrQICAAAAAa4CAgAAAASvAgIAAAAEsAICAAAAAbECAgAAAAGyAgIAAAABswICAAAAAbQCAgDQAwAhCK0CCAAAAAGuAggAAAAErwIIAAAABLACCAAAAAGxAggAAAABsgIIAAAAAbMCCAAAAAG0AggA0QMAIQcGAAC_AwAgLwAA0wMAIDAAANMDACCtAgAAAMkCAq4CAAAAyQIIrwIAAADJAgi0AgAA0gPJAiIErQIAAADJAgKuAgAAAMkCCK8CAAAAyQIItAIAANMDyQIiCqUCAADUAwAwpgIAAOICABCnAgAA1AMAMKgCAQDVAwAhqwJAANgDACHCAkAA2AMAIcYCAQDVAwAhxwIBANUDACHJAgAA1gPJAiLKAgIA1wMAIQutAgEAAAABrgIBAAAABK8CAQAAAASwAgEAAAABsQIBAAAAAbICAQAAAAGzAgEAAAABtAIBAMMDACG7AgEAAAABvAIBAAAAAb0CAQAAAAEErQIAAADJAgKuAgAAAMkCCK8CAAAAyQIItAIAANMDyQIiCK0CAgAAAAGuAgIAAAAErwICAAAABLACAgAAAAGxAgIAAAABsgICAAAAAbMCAgAAAAG0AgIAvwMAIQitAkAAAAABrgJAAAAABK8CQAAAAASwAkAAAAABsQJAAAAAAbICQAAAAAGzAkAAAAABtAJAAMADACECxgIBAAAAAckCAAAAyQICCaUCAADaAwAwpgIAANwCABCnAgAA2gMAMKgCAQC7AwAhqwJAAL0DACGsAgEAuwMAIcwCAQC7AwAhzQIBALsDACHOAgEAxQMAIQmlAgAA2wMAMKYCAADGAgAQpwIAANsDADCoAgEAuwMAIawCAQC7AwAhzwIBALsDACHQAggA3AMAIdECIADdAwAh0gIBALsDACENBgAAvwMAIC8AANEDACAwAADRAwAgQQAA0QMAIEIAANEDACCtAggAAAABrgIIAAAABK8CCAAAAASwAggAAAABsQIIAAAAAbICCAAAAAGzAggAAAABtAIIAOADACEFBgAAvwMAIC8AAN8DACAwAADfAwAgrQIgAAAAAbQCIADeAwAhBQYAAL8DACAvAADfAwAgMAAA3wMAIK0CIAAAAAG0AiAA3gMAIQKtAiAAAAABtAIgAN8DACENBgAAvwMAIC8AANEDACAwAADRAwAgQQAA0QMAIEIAANEDACCtAggAAAABrgIIAAAABK8CCAAAAASwAggAAAABsQIIAAAAAbICCAAAAAGzAggAAAABtAIIAOADACENFggA3AMAIaUCAADhAwAwpgIAALACABCnAgAA4QMAMKwCAQC7AwAh0wIBALsDACHUAggA3AMAIdUCAgDPAwAh1gIIANwDACHXAggA3AMAIdgCAgDPAwAh2QIIANwDACHaAkAAvQMAIQqlAgAA4gMAMKYCAACaAgAQpwIAAOIDADCoAgEAuwMAIasCQAC9AwAhrAIBALsDACHPAgEAuwMAIdsCAgDPAwAh3AIBAMUDACHdAgIAzwMAIQWlAgAA4wMAMKYCAACEAgAQpwIAAOMDADDeAgEAuwMAId8CAQC7AwAhD6UCAADkAwAwpgIAAO4BABCnAgAA5AMAMKgCAQC7AwAhqwJAAL0DACHKAgIAzwMAIeACQAC9AwAh4gIAAOUD4gIi4wJAAL0DACHkAkAAxgMAIeUCQADGAwAh5gIBAMUDACHnAkAAvQMAIegCAQC7AwAh6QIBALsDACEHBgAAvwMAIC8AAOcDACAwAADnAwAgrQIAAADiAgKuAgAAAOICCK8CAAAA4gIItAIAAOYD4gIiBwYAAL8DACAvAADnAwAgMAAA5wMAIK0CAAAA4gICrgIAAADiAgivAgAAAOICCLQCAADmA-ICIgStAgAAAOICAq4CAAAA4gIIrwIAAADiAgi0AgAA5wPiAiILpQIAAOgDADCmAgAA2AEAEKcCAADoAwAwqAIBALsDACGrAkAAvQMAIawCAQC7AwAh5wJAAL0DACHqAgEAuwMAIesCAQC7AwAh7AIBALsDACHtAgEAxQMAIQylAgAA6QMAMKYCAADCAQAQpwIAAOkDADCoAgEAuwMAIasCQAC9AwAh3gIBALsDACHuAgEAuwMAIfACAADqA_ACIvECQAC9AwAh8gIBAMUDACHzAiAA3QMAIfQCAgDrAwAhBwYAAL8DACAvAADvAwAgMAAA7wMAIK0CAAAA8AICrgIAAADwAgivAgAAAPACCLQCAADuA_ACIg0GAADIAwAgLwAAyAMAIDAAAMgDACBBAADtAwAgQgAAyAMAIK0CAgAAAAGuAgIAAAAFrwICAAAABbACAgAAAAGxAgIAAAABsgICAAAAAbMCAgAAAAG0AgIA7AMAIQ0GAADIAwAgLwAAyAMAIDAAAMgDACBBAADtAwAgQgAAyAMAIK0CAgAAAAGuAgIAAAAFrwICAAAABbACAgAAAAGxAgIAAAABsgICAAAAAbMCAgAAAAG0AgIA7AMAIQitAggAAAABrgIIAAAABa8CCAAAAAWwAggAAAABsQIIAAAAAbICCAAAAAGzAggAAAABtAIIAO0DACEHBgAAvwMAIC8AAO8DACAwAADvAwAgrQIAAADwAgKuAgAAAPACCK8CAAAA8AIItAIAAO4D8AIiBK0CAAAA8AICrgIAAADwAgivAgAAAPACCLQCAADvA_ACIgmlAgAA8AMAMKYCAACsAQAQpwIAAPADADCoAgEAuwMAId4CAQC7AwAh9QICAM8DACH2AgIAzwMAIfcCAgDPAwAh-AIBAMUDACEQpQIAAPEDADCmAgAAlgEAEKcCAADxAwAwqAIBALsDACGrAkAAvQMAIc8CAQC7AwAh0wIBALsDACHwAgAA9AOAAyLyAgEAxQMAIfoCAADyA_oCIvwCAADzA_wCIv0CCADcAwAh_gICAM8DACGAAwEAxQMAIYEDAQDFAwAhggMBAMUDACEHBgAAvwMAIC8AAPoDACAwAAD6AwAgrQIAAAD6AgKuAgAAAPoCCK8CAAAA-gIItAIAAPkD-gIiBwYAAL8DACAvAAD4AwAgMAAA-AMAIK0CAAAA_AICrgIAAAD8AgivAgAAAPwCCLQCAAD3A_wCIgcGAAC_AwAgLwAA9gMAIDAAAPYDACCtAgAAAIADAq4CAAAAgAMIrwIAAACAAwi0AgAA9QOAAyIHBgAAvwMAIC8AAPYDACAwAAD2AwAgrQIAAACAAwKuAgAAAIADCK8CAAAAgAMItAIAAPUDgAMiBK0CAAAAgAMCrgIAAACAAwivAgAAAIADCLQCAAD2A4ADIgcGAAC_AwAgLwAA-AMAIDAAAPgDACCtAgAAAPwCAq4CAAAA_AIIrwIAAAD8Agi0AgAA9wP8AiIErQIAAAD8AgKuAgAAAPwCCK8CAAAA_AIItAIAAPgD_AIiBwYAAL8DACAvAAD6AwAgMAAA-gMAIK0CAAAA-gICrgIAAAD6AgivAgAAAPoCCLQCAAD5A_oCIgStAgAAAPoCAq4CAAAA-gIIrwIAAAD6Agi0AgAA-gP6AiIKpQIAAPsDADCmAgAAfgAQpwIAAPsDADCoAgEAuwMAIasCQAC9AwAhrAIBALsDACHzAiAA3QMAIYMDAgDPAwAhhAMBALsDACGFAwIAzwMAIQilAgAA_AMAMKYCAABoABCnAgAA_AMAMKgCAQC7AwAhqwJAAL0DACHGAgEAuwMAIc8CAQC7AwAhhgMBALsDACEREwAA_gMAIBUAAP8DACAWAACABAAgFwAAgQQAIBgAAIIEACAZAACDBAAgGgAAhAQAIBsAAIUEACAcAACGBAAgpQIAAP0DADCmAgAAVQAQpwIAAP0DADCoAgEA1QMAIasCQADYAwAhxgIBANUDACHPAgEA1QMAIYYDAQDVAwAhA4cDAAADACCIAwAAAwAgiQMAAAMAIAOHAwAALwAgiAMAAC8AIIkDAAAvACADhwMAACcAIIgDAAAnACCJAwAAJwAgA4cDAAA0ACCIAwAANAAgiQMAADQAIAOHAwAAOAAgiAMAADgAIIkDAAA4ACADhwMAADwAIIgDAAA8ACCJAwAAPAAgA4cDAAALACCIAwAACwAgiQMAAAsAIAOHAwAAQwAgiAMAAEMAIIkDAABDACADhwMAAEcAIIgDAABHACCJAwAARwAgDQMAAIkEACALAACKBAAgpQIAAIcEADCmAgAARwAQpwIAAIcEADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHnAkAA2AMAIeoCAQDVAwAh6wIBANUDACHsAgEA1QMAIe0CAQCIBAAhC60CAQAAAAGuAgEAAAAFrwIBAAAABbACAQAAAAGxAgEAAAABsgIBAAAAAbMCAQAAAAG0AgEAywMAIbsCAQAAAAG8AgEAAAABvQIBAAAAARMTAAD-AwAgFQAA_wMAIBYAAIAEACAXAACBBAAgGAAAggQAIBkAAIMEACAaAACEBAAgGwAAhQQAIBwAAIYEACClAgAA_QMAMKYCAABVABCnAgAA_QMAMKgCAQDVAwAhqwJAANgDACHGAgEA1QMAIc8CAQDVAwAhhgMBANUDACGPAwAAVQAgkAMAAFUAIAOHAwAAFwAgiAMAABcAIIkDAAAXACACqQIBAAAAAawCAQAAAAEJAwAAiQQAIKUCAACMBAAwpgIAAEMAEKcCAACMBAAwqAIBANUDACGpAgEA1QMAIaoCAACNBAAgqwJAANgDACGsAgEA1QMAIQytAoAAAAABsAKAAAAAAbECgAAAAAGyAoAAAAABswKAAAAAAbQCgAAAAAG1AgEAAAABtgIBAAAAAbcCAQAAAAG4AoAAAAABuQKAAAAAAboCgAAAAAEMAwAAiQQAIAUAAI8EACClAgAAjgQAMKYCAAALABCnAgAAjgQAMKgCAQDVAwAhqwJAANgDACGsAgEA1QMAIc8CAQDVAwAh2wICANcDACHcAgEAiAQAId0CAgDXAwAhA4cDAAAHACCIAwAABwAgiQMAAAcAIA4DAACJBAAgpQIAAJAEADCmAgAAPAAQpwIAAJAEADCoAgEA1QMAIasCQADYAwAhrAIBANUDACG-AgEA1QMAIb8CAQDVAwAhwAIBAIgEACHBAgEAiAQAIcICQADYAwAhwwJAANgDACHEAkAAkQQAIQitAkAAAAABrgJAAAAABa8CQAAAAAWwAkAAAAABsQJAAAAAAbICQAAAAAGzAkAAAAABtAJAAMkDACEJAwAAiQQAIKUCAACSBAAwpgIAADgAEKcCAACSBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhwgJAANgDACHFAgEA1QMAIQoDAACJBAAgpQIAAJMEADCmAgAANAAQpwIAAJMEADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHMAgEA1QMAIc0CAQDVAwAhzgIBAIgEACEDrAIBAAAAAYMDAgAAAAGFAwIAAAABDgMAAIkEACAFAACPBAAgEgAAgAQAIBMAAP4DACClAgAAlQQAMKYCAAAvABCnAgAAlQQAMKgCAQDVAwAhqwJAANgDACGsAgEA1QMAIfMCIACWBAAhgwMCANcDACGEAwEA1QMAIYUDAgDXAwAhAq0CIAAAAAG0AiAA3wMAIQKsAgEAAAAB0wIBAAAAAQ8DAACJBAAgBAAAmgQAIBYIAJkEACGlAgAAmAQAMKYCAAAnABCnAgAAmAQAMKwCAQDVAwAh0wIBANUDACHUAggAmQQAIdUCAgDXAwAh1gIIAJkEACHXAggAmQQAIdgCAgDXAwAh2QIIAJkEACHaAkAA2AMAIQitAggAAAABrgIIAAAABK8CCAAAAASwAggAAAABsQIIAAAAAbICCAAAAAGzAggAAAABtAIIANEDACEQAwAAiQQAIAUAAI8EACASAACABAAgEwAA_gMAIKUCAACVBAAwpgIAAC8AEKcCAACVBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAh8wIgAJYEACGDAwIA1wMAIYQDAQDVAwAhhQMCANcDACGPAwAALwAgkAMAAC8AIALeAgEAAAAB3wIBAAAAAQcIAACdBAAgDwAAnQQAIKUCAACcBAAwpgIAAB4AEKcCAACcBAAw3gIBANUDACHfAgEA1QMAIRgEAACaBAAgBwAAqwQAIAkAAKwEACAOAACtBAAgEAAArgQAIBEAAK4EACClAgAApwQAMKYCAAAHABCnAgAApwQAMKgCAQDVAwAhqwJAANgDACHPAgEA1QMAIdMCAQDVAwAh8AIAAKoEgAMi8gIBAIgEACH6AgAAqAT6AiL8AgAAqQT8AiL9AggAmQQAIf4CAgDXAwAhgAMBAIgEACGBAwEAiAQAIYIDAQCIBAAhjwMAAAcAIJADAAAHACAD4AJAAAAAAegCAQAAAAHpAgEAAAABEQoAAKEEACAMAACiBAAgpQIAAJ8EADCmAgAAFwAQpwIAAJ8EADCoAgEA1QMAIasCQADYAwAhygICANcDACHgAkAA2AMAIeICAACgBOICIuMCQADYAwAh5AJAAJEEACHlAkAAkQQAIeYCAQCIBAAh5wJAANgDACHoAgEA1QMAIekCAQDVAwAhBK0CAAAA4gICrgIAAADiAgivAgAAAOICCLQCAADnA-ICIhAIAACdBAAgDQAAigQAIKUCAACjBAAwpgIAABMAEKcCAACjBAAwqAIBANUDACGrAkAA2AMAId4CAQDVAwAh7gIBANUDACHwAgAApATwAiLxAkAA2AMAIfICAQCIBAAh8wIgAJYEACH0AgIApQQAIY8DAAATACCQAwAAEwAgDwMAAIkEACALAACKBAAgpQIAAIcEADCmAgAARwAQpwIAAIcEADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHnAkAA2AMAIeoCAQDVAwAh6wIBANUDACHsAgEA1QMAIe0CAQCIBAAhjwMAAEcAIJADAABHACAOCAAAnQQAIA0AAIoEACClAgAAowQAMKYCAAATABCnAgAAowQAMKgCAQDVAwAhqwJAANgDACHeAgEA1QMAIe4CAQDVAwAh8AIAAKQE8AIi8QJAANgDACHyAgEAiAQAIfMCIACWBAAh9AICAKUEACEErQIAAADwAgKuAgAAAPACCK8CAAAA8AIItAIAAO8D8AIiCK0CAgAAAAGuAgIAAAAFrwICAAAABbACAgAAAAGxAgIAAAABsgICAAAAAbMCAgAAAAG0AgIAyAMAIQoIAACdBAAgpQIAAKYEADCmAgAADwAQpwIAAKYEADCoAgEA1QMAId4CAQDVAwAh9QICANcDACH2AgIA1wMAIfcCAgDXAwAh-AIBAIgEACEWBAAAmgQAIAcAAKsEACAJAACsBAAgDgAArQQAIBAAAK4EACARAACuBAAgpQIAAKcEADCmAgAABwAQpwIAAKcEADCoAgEA1QMAIasCQADYAwAhzwIBANUDACHTAgEA1QMAIfACAACqBIADIvICAQCIBAAh-gIAAKgE-gIi_AIAAKkE_AIi_QIIAJkEACH-AgIA1wMAIYADAQCIBAAhgQMBAIgEACGCAwEAiAQAIQStAgAAAPoCAq4CAAAA-gIIrwIAAAD6Agi0AgAA-gP6AiIErQIAAAD8AgKuAgAAAPwCCK8CAAAA_AIItAIAAPgD_AIiBK0CAAAAgAMCrgIAAACAAwivAgAAAIADCLQCAAD2A4ADIg4DAACJBAAgBQAAjwQAIKUCAACOBAAwpgIAAAsAEKcCAACOBAAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhzwIBANUDACHbAgIA1wMAIdwCAQCIBAAh3QICANcDACGPAwAACwAgkAMAAAsAIAOHAwAADwAgiAMAAA8AIIkDAAAPACADhwMAABMAIIgDAAATACCJAwAAEwAgA4cDAAAeACCIAwAAHgAgiQMAAB4AIAsDAACJBAAgFAAAmgQAIKUCAACvBAAwpgIAAAMAEKcCAACvBAAwqAIBANUDACGsAgEA1QMAIc8CAQDVAwAh0AIIAJkEACHRAiAAlgQAIdICAQDVAwAhAAAAAZQDAQAAAAEBlANAAAAAAQUpAACjCAAgKgAApggAIJEDAACkCAAgkgMAAKUIACCXAwAAAQAgAykAAKMIACCRAwAApAgAIJcDAAABACAAAAAAAZQDAQAAAAEBlANAAAAAAQUpAACeCAAgKgAAoQgAIJEDAACfCAAgkgMAAKAIACCXAwAAAQAgAykAAJ4IACCRAwAAnwgAIJcDAAABACAAAAAFKQAAmQgAICoAAJwIACCRAwAAmggAIJIDAACbCAAglwMAAAEAIAMpAACZCAAgkQMAAJoIACCXAwAAAQAgAAAAAAABlAMAAADJAgIFlAMCAAAAAZoDAgAAAAGbAwIAAAABnAMCAAAAAZ0DAgAAAAEAAAAFKQAAlAgAICoAAJcIACCRAwAAlQgAIJIDAACWCAAglwMAAAEAIAMpAACUCAAgkQMAAJUIACCXAwAAAQAgAAAAAAAFlAMIAAAAAZoDCAAAAAGbAwgAAAABnAMIAAAAAZ0DCAAAAAEBlAMgAAAAAQUpAACMCAAgKgAAkggAIJEDAACNCAAgkgMAAJEIACCXAwAAMQAgBSkAAIoIACAqAACPCAAgkQMAAIsIACCSAwAAjggAIJcDAAABACADKQAAjAgAIJEDAACNCAAglwMAADEAIAMpAACKCAAgkQMAAIsIACCXAwAAAQAgAAAAAAAFKQAAgggAICoAAIgIACCRAwAAgwgAIJIDAACHCAAglwMAAAEAIAUpAACACAAgKgAAhQgAIJEDAACBCAAgkgMAAIQIACCXAwAAMQAgAykAAIIIACCRAwAAgwgAIJcDAAABACADKQAAgAgAIJEDAACBCAAglwMAADEAIAAAAAAABSkAAOEHACAqAAD-BwAgkQMAAOIHACCSAwAA_QcAIJcDAAABACALKQAA6wQAMCoAAPAEADCRAwAA7AQAMJIDAADtBAAwkwMAAO4EACCUAwAA7wQAMJUDAADvBAAwlgMAAO8EADCXAwAA7wQAMJgDAADxBAAwmQMAAPIEADARBAAAwwUAIAkAAMQFACAOAADFBQAgEAAAxgUAIBEAAMcFACCoAgEAAAABqwJAAAAAAc8CAQAAAAHTAgEAAAAB8AIAAACAAwLyAgEAAAAB-gIAAAD6AgL8AgAAAPwCAv0CCAAAAAH-AgIAAAABgAMBAAAAAYEDAQAAAAECAAAACQAgKQAAwgUAIAMAAAAJACApAADCBQAgKgAA-AQAIAEiAAD8BwAwFgQAAJoEACAHAACrBAAgCQAArAQAIA4AAK0EACAQAACuBAAgEQAArgQAIKUCAACnBAAwpgIAAAcAEKcCAACnBAAwqAIBAAAAAasCQADYAwAhzwIBANUDACHTAgEA1QMAIfACAACqBIADIvICAQCIBAAh-gIAAKgE-gIi_AIAAKkE_AIi_QIIAJkEACH-AgIA1wMAIYADAQCIBAAhgQMBAIgEACGCAwEAiAQAIQIAAAAJACAiAAD4BAAgAgAAAPMEACAiAAD0BAAgEKUCAADyBAAwpgIAAPMEABCnAgAA8gQAMKgCAQDVAwAhqwJAANgDACHPAgEA1QMAIdMCAQDVAwAh8AIAAKoEgAMi8gIBAIgEACH6AgAAqAT6AiL8AgAAqQT8AiL9AggAmQQAIf4CAgDXAwAhgAMBAIgEACGBAwEAiAQAIYIDAQCIBAAhEKUCAADyBAAwpgIAAPMEABCnAgAA8gQAMKgCAQDVAwAhqwJAANgDACHPAgEA1QMAIdMCAQDVAwAh8AIAAKoEgAMi8gIBAIgEACH6AgAAqAT6AiL8AgAAqQT8AiL9AggAmQQAIf4CAgDXAwAhgAMBAIgEACGBAwEAiAQAIYIDAQCIBAAhDKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIQGUAwAAAPoCAgGUAwAAAPwCAgGUAwAAAIADAhEEAAD5BAAgCQAA-gQAIA4AAPsEACAQAAD8BAAgEQAA_QQAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIQUpAADjBwAgKgAA-gcAIJEDAADkBwAgkgMAAPkHACCXAwAAMQAgCykAALYFADAqAAC7BQAwkQMAALcFADCSAwAAuAUAMJMDAAC5BQAglAMAALoFADCVAwAAugUAMJYDAAC6BQAwlwMAALoFADCYAwAAvAUAMJkDAAC9BQAwCykAAJcFADAqAACcBQAwkQMAAJgFADCSAwAAmQUAMJMDAACaBQAglAMAAJsFADCVAwAAmwUAMJYDAACbBQAwlwMAAJsFADCYAwAAnQUAMJkDAACeBQAwCykAAIwFADAqAACQBQAwkQMAAI0FADCSAwAAjgUAMJMDAACPBQAglAMAAIIFADCVAwAAggUAMJYDAACCBQAwlwMAAIIFADCYAwAAkQUAMJkDAACFBQAwCykAAP4EADAqAACDBQAwkQMAAP8EADCSAwAAgAUAMJMDAACBBQAglAMAAIIFADCVAwAAggUAMJYDAACCBQAwlwMAAIIFADCYAwAAhAUAMJkDAACFBQAwAggAAIsFACDeAgEAAAABAgAAACAAICkAAIoFACADAAAAIAAgKQAAigUAICoAAIgFACABIgAA-AcAMAgIAACdBAAgDwAAnQQAIKUCAACcBAAwpgIAAB4AEKcCAACcBAAw3gIBANUDACHfAgEA1QMAIY0DAACbBAAgAgAAACAAICIAAIgFACACAAAAhgUAICIAAIcFACAFpQIAAIUFADCmAgAAhgUAEKcCAACFBQAw3gIBANUDACHfAgEA1QMAIQWlAgAAhQUAMKYCAACGBQAQpwIAAIUFADDeAgEA1QMAId8CAQDVAwAhAd4CAQCzBAAhAggAAIkFACDeAgEAswQAIQUpAADzBwAgKgAA9gcAIJEDAAD0BwAgkgMAAPUHACCXAwAACQAgAggAAIsFACDeAgEAAAABAykAAPMHACCRAwAA9AcAIJcDAAAJACACDwAAlgUAIN8CAQAAAAECAAAAIAAgKQAAlQUAIAMAAAAgACApAACVBQAgKgAAkwUAIAEiAADyBwAwAgAAACAAICIAAJMFACACAAAAhgUAICIAAJIFACAB3wIBALMEACECDwAAlAUAIN8CAQCzBAAhBSkAAO0HACAqAADwBwAgkQMAAO4HACCSAwAA7wcAIJcDAAAJACACDwAAlgUAIN8CAQAAAAEDKQAA7QcAIJEDAADuBwAglwMAAAkAIAkNAAC1BQAgqAIBAAAAAasCQAAAAAHuAgEAAAAB8AIAAADwAgLxAkAAAAAB8gIBAAAAAfMCIAAAAAH0AgIAAAABAgAAABUAICkAALQFACADAAAAFQAgKQAAtAUAICoAAKMFACABIgAA7AcAMA4IAACdBAAgDQAAigQAIKUCAACjBAAwpgIAABMAEKcCAACjBAAwqAIBAAAAAasCQADYAwAh3gIBANUDACHuAgEA1QMAIfACAACkBPACIvECQADYAwAh8gIBAIgEACHzAiAAlgQAIfQCAgClBAAhAgAAABUAICIAAKMFACACAAAAnwUAICIAAKAFACAMpQIAAJ4FADCmAgAAnwUAEKcCAACeBQAwqAIBANUDACGrAkAA2AMAId4CAQDVAwAh7gIBANUDACHwAgAApATwAiLxAkAA2AMAIfICAQCIBAAh8wIgAJYEACH0AgIApQQAIQylAgAAngUAMKYCAACfBQAQpwIAAJ4FADCoAgEA1QMAIasCQADYAwAh3gIBANUDACHuAgEA1QMAIfACAACkBPACIvECQADYAwAh8gIBAIgEACHzAiAAlgQAIfQCAgClBAAhCKgCAQCzBAAhqwJAALQEACHuAgEAswQAIfACAAChBfACIvECQAC0BAAh8gIBALsEACHzAiAA1gQAIfQCAgCiBQAhAZQDAAAA8AICBZQDAgAAAAGaAwIAAAABmwMCAAAAAZwDAgAAAAGdAwIAAAABCQ0AAKQFACCoAgEAswQAIasCQAC0BAAh7gIBALMEACHwAgAAoQXwAiLxAkAAtAQAIfICAQC7BAAh8wIgANYEACH0AgIAogUAIQspAAClBQAwKgAAqgUAMJEDAACmBQAwkgMAAKcFADCTAwAAqAUAIJQDAACpBQAwlQMAAKkFADCWAwAAqQUAMJcDAACpBQAwmAMAAKsFADCZAwAArAUAMAwMAACzBQAgqAIBAAAAAasCQAAAAAHKAgIAAAAB4AJAAAAAAeICAAAA4gIC4wJAAAAAAeQCQAAAAAHlAkAAAAAB5gIBAAAAAecCQAAAAAHpAgEAAAABAgAAABkAICkAALIFACADAAAAGQAgKQAAsgUAICoAALAFACABIgAA6wcAMBIKAAChBAAgDAAAogQAIKUCAACfBAAwpgIAABcAEKcCAACfBAAwqAIBAAAAAasCQADYAwAhygICANcDACHgAkAA2AMAIeICAACgBOICIuMCQADYAwAh5AJAAJEEACHlAkAAkQQAIeYCAQCIBAAh5wJAANgDACHoAgEA1QMAIekCAQDVAwAhjgMAAJ4EACACAAAAGQAgIgAAsAUAIAIAAACtBQAgIgAArgUAIA-lAgAArAUAMKYCAACtBQAQpwIAAKwFADCoAgEA1QMAIasCQADYAwAhygICANcDACHgAkAA2AMAIeICAACgBOICIuMCQADYAwAh5AJAAJEEACHlAkAAkQQAIeYCAQCIBAAh5wJAANgDACHoAgEA1QMAIekCAQDVAwAhD6UCAACsBQAwpgIAAK0FABCnAgAArAUAMKgCAQDVAwAhqwJAANgDACHKAgIA1wMAIeACQADYAwAh4gIAAKAE4gIi4wJAANgDACHkAkAAkQQAIeUCQACRBAAh5gIBAIgEACHnAkAA2AMAIegCAQDVAwAh6QIBANUDACELqAIBALMEACGrAkAAtAQAIcoCAgDKBAAh4AJAALQEACHiAgAArwXiAiLjAkAAtAQAIeQCQAC8BAAh5QJAALwEACHmAgEAuwQAIecCQAC0BAAh6QIBALMEACEBlAMAAADiAgIMDAAAsQUAIKgCAQCzBAAhqwJAALQEACHKAgIAygQAIeACQAC0BAAh4gIAAK8F4gIi4wJAALQEACHkAkAAvAQAIeUCQAC8BAAh5gIBALsEACHnAkAAtAQAIekCAQCzBAAhBSkAAOYHACAqAADpBwAgkQMAAOcHACCSAwAA6AcAIJcDAABJACAMDAAAswUAIKgCAQAAAAGrAkAAAAABygICAAAAAeACQAAAAAHiAgAAAOICAuMCQAAAAAHkAkAAAAAB5QJAAAAAAeYCAQAAAAHnAkAAAAAB6QIBAAAAAQMpAADmBwAgkQMAAOcHACCXAwAASQAgCQ0AALUFACCoAgEAAAABqwJAAAAAAe4CAQAAAAHwAgAAAPACAvECQAAAAAHyAgEAAAAB8wIgAAAAAfQCAgAAAAEEKQAApQUAMJEDAACmBQAwkwMAAKgFACCXAwAAqQUAMAWoAgEAAAAB9QICAAAAAfYCAgAAAAH3AgIAAAAB-AIBAAAAAQIAAAARACApAADBBQAgAwAAABEAICkAAMEFACAqAADABQAgASIAAOUHADAKCAAAnQQAIKUCAACmBAAwpgIAAA8AEKcCAACmBAAwqAIBAAAAAd4CAQDVAwAh9QICANcDACH2AgIA1wMAIfcCAgDXAwAh-AIBAIgEACECAAAAEQAgIgAAwAUAIAIAAAC-BQAgIgAAvwUAIAmlAgAAvQUAMKYCAAC-BQAQpwIAAL0FADCoAgEA1QMAId4CAQDVAwAh9QICANcDACH2AgIA1wMAIfcCAgDXAwAh-AIBAIgEACEJpQIAAL0FADCmAgAAvgUAEKcCAAC9BQAwqAIBANUDACHeAgEA1QMAIfUCAgDXAwAh9gICANcDACH3AgIA1wMAIfgCAQCIBAAhBagCAQCzBAAh9QICAMoEACH2AgIAygQAIfcCAgDKBAAh-AIBALsEACEFqAIBALMEACH1AgIAygQAIfYCAgDKBAAh9wICAMoEACH4AgEAuwQAIQWoAgEAAAAB9QICAAAAAfYCAgAAAAH3AgIAAAAB-AIBAAAAAREEAADDBQAgCQAAxAUAIA4AAMUFACAQAADGBQAgEQAAxwUAIKgCAQAAAAGrAkAAAAABzwIBAAAAAdMCAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAQMpAADjBwAgkQMAAOQHACCXAwAAMQAgBCkAALYFADCRAwAAtwUAMJMDAAC5BQAglwMAALoFADAEKQAAlwUAMJEDAACYBQAwkwMAAJoFACCXAwAAmwUAMAQpAACMBQAwkQMAAI0FADCTAwAAjwUAIJcDAACCBQAwBCkAAP4EADCRAwAA_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-gIAAAD6AgL8AgAAAPwCAv0CCAAAAAH-AgIAAAABgAMBAAAAAYEDAQAAAAGCAwEAAAABAgAAAAkAICkAAKIGACADAAAACQAgKQAAogYAICoAAKEGACABIgAAwQcAMAIAAAAJACAiAAChBgAgAgAAAPMEACAiAACgBgAgDKgCAQCzBAAhqwJAALQEACHPAgEAswQAIfACAAD3BIADIvICAQC7BAAh-gIAAPUE-gIi_AIAAPYE_AIi_QIIANUEACH-AgIAygQAIYADAQC7BAAhgQMBALsEACGCAwEAuwQAIREHAAD3BQAgCQAA-gQAIA4AAPsEACAQAAD8BAAgEQAA_QQAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIfACAAD3BIADIvICAQC7BAAh-gIAAPUE-gIi_AIAAPYE_AIi_QIIANUEACH-AgIAygQAIYADAQC7BAAhgQMBALsEACGCAwEAuwQAIREHAAD4BQAgCQAAxAUAIA4AAMUFACAQAADGBQAgEQAAxwUAIKgCAQAAAAGrAkAAAAABzwIBAAAAAfACAAAAgAMC8gIBAAAAAfoCAAAA-gIC_AIAAAD8AgL9AggAAAAB_gICAAAAAYADAQAAAAGBAwEAAAABggMBAAAAAQMpAAC_BwAgkQMAAMAHACCXAwAAAQAgBCkAAJoGADCRAwAAmwYAMJMDAACdBgAglwMAAO8EADAEKQAAjgYAMJEDAACPBgAwkwMAAJEGACCXAwAAkgYAMAQpAACCBgAwkQMAAIMGADCTAwAAhQYAIJcDAACGBgAwAAAACykAAJAHADAqAACUBwAwkQMAAJEHADCSAwAAkgcAMJMDAACTBwAglAMAAIYGADCVAwAAhgYAMJYDAACGBgAwlwMAAIYGADCYAwAAlQcAMJkDAACJBgAwCykAAIQHADAqAACJBwAwkQMAAIUHADCSAwAAhgcAMJMDAACHBwAglAMAAIgHADCVAwAAiAcAMJYDAACIBwAwlwMAAIgHADCYAwAAigcAMJkDAACLBwAwCykAAPsGADAqAAD_BgAwkQMAAPwGADCSAwAA_QYAMJMDAAD-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_AgEAAAABwAIBAAAAAcECAQAAAAHCAkAAAAABwwJAAAAAAcQCQAAAAAECAAAAPgAgKQAA4gYAIAMAAAA-ACApAADiBgAgKgAA4QYAIAEiAAC7BwAwDgMAAIkEACClAgAAkAQAMKYCAAA8ABCnAgAAkAQAMKgCAQAAAAGrAkAA2AMAIawCAQDVAwAhvgIBAAAAAb8CAQDVAwAhwAIBAIgEACHBAgEAiAQAIcICQADYAwAhwwJAANgDACHEAkAAkQQAIQIAAAA-ACAiAADhBgAgAgAAAN8GACAiAADgBgAgDaUCAADeBgAwpgIAAN8GABCnAgAA3gYAMKgCAQDVAwAhqwJAANgDACGsAgEA1QMAIb4CAQDVAwAhvwIBANUDACHAAgEAiAQAIcECAQCIBAAhwgJAANgDACHDAkAA2AMAIcQCQACRBAAhDaUCAADeBgAwpgIAAN8GABCnAgAA3gYAMKgCAQDVAwAhqwJAANgDACGsAgEA1QMAIb4CAQDVAwAhvwIBANUDACHAAgEAiAQAIcECAQCIBAAhwgJAANgDACHDAkAA2AMAIcQCQACRBAAhCagCAQCzBAAhqwJAALQEACG-AgEAswQAIb8CAQCzBAAhwAIBALsEACHBAgEAuwQAIcICQAC0BAAhwwJAALQEACHEAkAAvAQAIQmoAgEAswQAIasCQAC0BAAhvgIBALMEACG_AgEAswQAIcACAQC7BAAhwQIBALsEACHCAkAAtAQAIcMCQAC0BAAhxAJAALwEACEJqAIBAAAAAasCQAAAAAG-AgEAAAABvwIBAAAAAcACAQAAAAHBAgEAAAABwgJAAAAAAcMCQAAAAAHEAkAAAAABBKgCAQAAAAGrAkAAAAABwgJAAAAAAcUCAQAAAAECAAAAOgAgKQAA7gYAIAMAAAA6ACApAADuBgAgKgAA7QYAIAEiAAC6BwAwCQMAAIkEACClAgAAkgQAMKYCAAA4ABCnAgAAkgQAMKgCAQAAAAGrAkAA2AMAIawCAQDVAwAhwgJAANgDACHFAgEAAAABAgAAADoAICIAAO0GACACAAAA6wYAICIAAOwGACAIpQIAAOoGADCmAgAA6wYAEKcCAADqBgAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhwgJAANgDACHFAgEA1QMAIQilAgAA6gYAMKYCAADrBgAQpwIAAOoGADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHCAkAA2AMAIcUCAQDVAwAhBKgCAQCzBAAhqwJAALQEACHCAkAAtAQAIcUCAQCzBAAhBKgCAQCzBAAhqwJAALQEACHCAkAAtAQAIcUCAQCzBAAhBKgCAQAAAAGrAkAAAAABwgJAAAAAAcUCAQAAAAEFqAIBAAAAAasCQAAAAAHMAgEAAAABzQIBAAAAAc4CAQAAAAECAAAANgAgKQAA-gYAIAMAAAA2ACApAAD6BgAgKgAA-QYAIAEiAAC5BwAwCgMAAIkEACClAgAAkwQAMKYCAAA0ABCnAgAAkwQAMKgCAQAAAAGrAkAA2AMAIawCAQDVAwAhzAIBANUDACHNAgEA1QMAIc4CAQCIBAAhAgAAADYAICIAAPkGACACAAAA9wYAICIAAPgGACAJpQIAAPYGADCmAgAA9wYAEKcCAAD2BgAwqAIBANUDACGrAkAA2AMAIawCAQDVAwAhzAIBANUDACHNAgEA1QMAIc4CAQCIBAAhCaUCAAD2BgAwpgIAAPcGABCnAgAA9gYAMKgCAQDVAwAhqwJAANgDACGsAgEA1QMAIcwCAQDVAwAhzQIBANUDACHOAgEAiAQAIQWoAgEAswQAIasCQAC0BAAhzAIBALMEACHNAgEAswQAIc4CAQC7BAAhBagCAQCzBAAhqwJAALQEACHMAgEAswQAIc0CAQCzBAAhzgIBALsEACEFqAIBAAAAAasCQAAAAAHMAgEAAAABzQIBAAAAAc4CAQAAAAEKBAAA4wQAIBYIAAAAAdMCAQAAAAHUAggAAAAB1QICAAAAAdYCCAAAAAHXAggAAAAB2AICAAAAAdkCCAAAAAHaAkAAAAABAgAAACkAICkAAIMHACADAAAAKQAgKQAAgwcAICoAAIIHACABIgAAuAcAMAIAAAApACAiAACCBwAgAgAAAJYGACAiAACBBwAgCRYIANUEACHTAgEAswQAIdQCCADVBAAh1QICAMoEACHWAggA1QQAIdcCCADVBAAh2AICAMoEACHZAggA1QQAIdoCQAC0BAAhCgQAAOEEACAWCADVBAAh0wIBALMEACHUAggA1QQAIdUCAgDKBAAh1gIIANUEACHXAggA1QQAIdgCAgDKBAAh2QIIANUEACHaAkAAtAQAIQoEAADjBAAgFggAAAAB0wIBAAAAAdQCCAAAAAHVAgIAAAAB1gIIAAAAAdcCCAAAAAHYAgIAAAAB2QIIAAAAAdoCQAAAAAEJBQAApAYAIBIAAKUGACATAACmBgAgqAIBAAAAAasCQAAAAAHzAiAAAAABgwMCAAAAAYQDAQAAAAGFAwIAAAABAgAAADEAICkAAI8HACADAAAAMQAgKQAAjwcAICoAAI4HACABIgAAtwcAMA8DAACJBAAgBQAAjwQAIBIAAIAEACATAAD-AwAgpQIAAJUEADCmAgAALwAQpwIAAJUEADCoAgEAAAABqwJAANgDACGsAgEA1QMAIfMCIACWBAAhgwMCANcDACGEAwEA1QMAIYUDAgDXAwAhiwMAAJQEACACAAAAMQAgIgAAjgcAIAIAAACMBwAgIgAAjQcAIAqlAgAAiwcAMKYCAACMBwAQpwIAAIsHADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHzAiAAlgQAIYMDAgDXAwAhhAMBANUDACGFAwIA1wMAIQqlAgAAiwcAMKYCAACMBwAQpwIAAIsHADCoAgEA1QMAIasCQADYAwAhrAIBANUDACHzAiAAlgQAIYMDAgDXAwAhhAMBANUDACGFAwIA1wMAIQaoAgEAswQAIasCQAC0BAAh8wIgANYEACGDAwIAygQAIYQDAQCzBAAhhQMCAMoEACEJBQAA_wUAIBIAAIAGACATAACBBgAgqAIBALMEACGrAkAAtAQAIfMCIADWBAAhgwMCAMoEACGEAwEAswQAIYUDAgDKBAAhCQUAAKQGACASAAClBgAgEwAApgYAIKgCAQAAAAGrAkAAAAAB8wIgAAAAAYMDAgAAAAGEAwEAAAABhQMCAAAAAQYUAADZBAAgqAIBAAAAAc8CAQAAAAHQAggAAAAB0QIgAAAAAdICAQAAAAECAAAABQAgKQAAmAcAIAMAAAAFACApAACYBwAgKgAAlwcAIAEiAAC2BwAwAgAAAAUAICIAAJcHACACAAAAigYAICIAAJYHACAFqAIBALMEACHPAgEAswQAIdACCADVBAAh0QIgANYEACHSAgEAswQAIQYUAADXBAAgqAIBALMEACHPAgEAswQAIdACCADVBAAh0QIgANYEACHSAgEAswQAIQYUAADZBAAgqAIBAAAAAc8CAQAAAAHQAggAAAAB0QIgAAAAAdICAQAAAAEEKQAAkAcAMJEDAACRBwAwkwMAAJMHACCXAwAAhgYAMAQpAACEBwAwkQMAAIUHADCTAwAAhwcAIJcDAACIBwAwBCkAAPsGADCRAwAA_AYAMJMDAAD-BgAglwMAAJIGADAEKQAA7wYAMJEDAADwBgAwkwMAAPIGACCXAwAA8wYAMAQpAADjBgAwkQMAAOQGADCTAwAA5gYAIJcDAADnBgAwBCkAANcGADCRAwAA2AYAMJMDAADaBgAglwMAANsGADAEKQAAywYAMJEDAADMBgAwkwMAAM4GACCXAwAAzwYAMAQpAAC_BgAwkQMAAMAGADCTAwAAwgYAIJcDAADDBgAwBCkAALMGADCRAwAAtAYAMJMDAAC2BgAglwMAALcGADAAAAAAAAAAAAAJEwAAogcAIBUAAKMHACAWAACkBwAgFwAApQcAIBgAAKYHACAZAACnBwAgGgAAqAcAIBsAAKkHACAcAACqBwAgAAAEAwAAqwcAIAUAAK0HACASAACkBwAgEwAAogcAIAoEAACuBwAgBwAAsgcAIAkAALMHACAOAAC0BwAgEAAAtQcAIBEAALUHACDyAgAAtwQAIIADAAC3BAAggQMAALcEACCCAwAAtwQAIAQIAACvBwAgDQAArAcAIPICAAC3BAAg9AIAALcEACADAwAAqwcAIAsAAKwHACDtAgAAtwQAIAMDAACrBwAgBQAArQcAINwCAAC3BAAgAAAABagCAQAAAAHPAgEAAAAB0AIIAAAAAdECIAAAAAHSAgEAAAABBqgCAQAAAAGrAkAAAAAB8wIgAAAAAYMDAgAAAAGEAwEAAAABhQMCAAAAAQkWCAAAAAHTAgEAAAAB1AIIAAAAAdUCAgAAAAHWAggAAAAB1wIIAAAAAdgCAgAAAAHZAggAAAAB2gJAAAAAAQWoAgEAAAABqwJAAAAAAcwCAQAAAAHNAgEAAAABzgIBAAAAAQSoAgEAAAABqwJAAAAAAcICQAAAAAHFAgEAAAABCagCAQAAAAGrAkAAAAABvgIBAAAAAb8CAQAAAAHAAgEAAAABwQIBAAAAAcICQAAAAAHDAkAAAAABxAJAAAAAAQaoAgEAAAABqwJAAAAAAc8CAQAAAAHbAgIAAAAB3AIBAAAAAd0CAgAAAAEEqAIBAAAAAakCAQAAAAGqAoAAAAABqwJAAAAAAQeoAgEAAAABqwJAAAAAAecCQAAAAAHqAgEAAAAB6wIBAAAAAewCAQAAAAHtAgEAAAABDRMAAJkHACAWAACbBwAgFwAAnAcAIBgAAJ0HACAZAACeBwAgGgAAnwcAIBsAAKAHACAcAAChBwAgqAIBAAAAAasCQAAAAAHGAgEAAAABzwIBAAAAAYYDAQAAAAECAAAAAQAgKQAAvwcAIAyoAgEAAAABqwJAAAAAAc8CAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAYIDAQAAAAEJFggAAAABrAIBAAAAAdQCCAAAAAHVAgIAAAAB1gIIAAAAAdcCCAAAAAHYAgIAAAAB2QIIAAAAAdoCQAAAAAEFqAIBAAAAAawCAQAAAAHPAgEAAAAB0AIIAAAAAdECIAAAAAEDAAAAVQAgKQAAvwcAICoAAMYHACAPAAAAVQAgEwAAqgYAIBYAAKwGACAXAACtBgAgGAAArgYAIBkAAK8GACAaAACwBgAgGwAAsQYAIBwAALIGACAiAADGBwAgqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQ0TAACqBgAgFgAArAYAIBcAAK0GACAYAACuBgAgGQAArwYAIBoAALAGACAbAACxBgAgHAAAsgYAIKgCAQCzBAAhqwJAALQEACHGAgEAswQAIc8CAQCzBAAhhgMBALMEACEIAwAAyAUAIKgCAQAAAAGrAkAAAAABrAIBAAAAAc8CAQAAAAHbAgIAAAAB3AIBAAAAAd0CAgAAAAECAAAAQQAgKQAAxwcAIAMAAAALACApAADHBwAgKgAAywcAIAoAAAALACADAADpBAAgIgAAywcAIKgCAQCzBAAhqwJAALQEACGsAgEAswQAIc8CAQCzBAAh2wICAMoEACHcAgEAuwQAId0CAgDKBAAhCAMAAOkEACCoAgEAswQAIasCQAC0BAAhrAIBALMEACHPAgEAswQAIdsCAgDKBAAh3AIBALsEACHdAgIAygQAIRIEAADDBQAgBwAA-AUAIA4AAMUFACAQAADGBQAgEQAAxwUAIKgCAQAAAAGrAkAAAAABzwIBAAAAAdMCAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAYIDAQAAAAECAAAACQAgKQAAzAcAIAMAAAAHACApAADMBwAgKgAA0AcAIBQAAAAHACAEAAD5BAAgBwAA9wUAIA4AAPsEACAQAAD8BAAgEQAA_QQAICIAANAHACCoAgEAswQAIasCQAC0BAAhzwIBALMEACHTAgEAswQAIfACAAD3BIADIvICAQC7BAAh-gIAAPUE-gIi_AIAAPYE_AIi_QIIANUEACH-AgIAygQAIYADAQC7BAAhgQMBALsEACGCAwEAuwQAIRIEAAD5BAAgBwAA9wUAIA4AAPsEACAQAAD8BAAgEQAA_QQAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIYIDAQC7BAAhEgQAAMMFACAHAAD4BQAgCQAAxAUAIBAAAMYFACARAADHBQAgqAIBAAAAAasCQAAAAAHPAgEAAAAB0wIBAAAAAfACAAAAgAMC8gIBAAAAAfoCAAAA-gIC_AIAAAD8AgL9AggAAAAB_gICAAAAAYADAQAAAAGBAwEAAAABggMBAAAAAQIAAAAJACApAADRBwAgAwAAAAcAICkAANEHACAqAADVBwAgFAAAAAcAIAQAAPkEACAHAAD3BQAgCQAA-gQAIBAAAPwEACARAAD9BAAgIgAA1QcAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIYIDAQC7BAAhEgQAAPkEACAHAAD3BQAgCQAA-gQAIBAAAPwEACARAAD9BAAgqAIBALMEACGrAkAAtAQAIc8CAQCzBAAh0wIBALMEACHwAgAA9wSAAyLyAgEAuwQAIfoCAAD1BPoCIvwCAAD2BPwCIv0CCADVBAAh_gICAMoEACGAAwEAuwQAIYEDAQC7BAAhggMBALsEACENEwAAmQcAIBUAAJoHACAWAACbBwAgFwAAnAcAIBgAAJ0HACAZAACeBwAgGgAAnwcAIBsAAKAHACCoAgEAAAABqwJAAAAAAcYCAQAAAAHPAgEAAAABhgMBAAAAAQIAAAABACApAADWBwAgC6gCAQAAAAGrAkAAAAABygICAAAAAeACQAAAAAHiAgAAAOICAuMCQAAAAAHkAkAAAAAB5QJAAAAAAeYCAQAAAAHnAkAAAAAB6AIBAAAAAQMAAABVACApAADWBwAgKgAA2wcAIA8AAABVACATAACqBgAgFQAAqwYAIBYAAKwGACAXAACtBgAgGAAArgYAIBkAAK8GACAaAACwBgAgGwAAsQYAICIAANsHACCoAgEAswQAIasCQAC0BAAhxgIBALMEACHPAgEAswQAIYYDAQCzBAAhDRMAAKoGACAVAACrBgAgFgAArAYAIBcAAK0GACAYAACuBgAgGQAArwYAIBoAALAGACAbAACxBgAgqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQoIAADqBQAgqAIBAAAAAasCQAAAAAHeAgEAAAAB7gIBAAAAAfACAAAA8AIC8QJAAAAAAfICAQAAAAHzAiAAAAAB9AICAAAAAQIAAAAVACApAADcBwAgAwAAABMAICkAANwHACAqAADgBwAgDAAAABMAIAgAAOkFACAiAADgBwAgqAIBALMEACGrAkAAtAQAId4CAQCzBAAh7gIBALMEACHwAgAAoQXwAiLxAkAAtAQAIfICAQC7BAAh8wIgANYEACH0AgIAogUAIQoIAADpBQAgqAIBALMEACGrAkAAtAQAId4CAQCzBAAh7gIBALMEACHwAgAAoQXwAiLxAkAAtAQAIfICAQC7BAAh8wIgANYEACH0AgIAogUAIQ0TAACZBwAgFQAAmgcAIBYAAJsHACAXAACcBwAgGAAAnQcAIBkAAJ4HACAbAACgBwAgHAAAoQcAIKgCAQAAAAGrAkAAAAABxgIBAAAAAc8CAQAAAAGGAwEAAAABAgAAAAEAICkAAOEHACAKAwAAowYAIBIAAKUGACATAACmBgAgqAIBAAAAAasCQAAAAAGsAgEAAAAB8wIgAAAAAYMDAgAAAAGEAwEAAAABhQMCAAAAAQIAAAAxACApAADjBwAgBagCAQAAAAH1AgIAAAAB9gICAAAAAfcCAgAAAAH4AgEAAAABCQMAAOIFACCoAgEAAAABqwJAAAAAAawCAQAAAAHnAkAAAAAB6gIBAAAAAesCAQAAAAHsAgEAAAAB7QIBAAAAAQIAAABJACApAADmBwAgAwAAAEcAICkAAOYHACAqAADqBwAgCwAAAEcAIAMAANcFACAiAADqBwAgqAIBALMEACGrAkAAtAQAIawCAQCzBAAh5wJAALQEACHqAgEAswQAIesCAQCzBAAh7AIBALMEACHtAgEAuwQAIQkDAADXBQAgqAIBALMEACGrAkAAtAQAIawCAQCzBAAh5wJAALQEACHqAgEAswQAIesCAQCzBAAh7AIBALMEACHtAgEAuwQAIQuoAgEAAAABqwJAAAAAAcoCAgAAAAHgAkAAAAAB4gIAAADiAgLjAkAAAAAB5AJAAAAAAeUCQAAAAAHmAgEAAAAB5wJAAAAAAekCAQAAAAEIqAIBAAAAAasCQAAAAAHuAgEAAAAB8AIAAADwAgLxAkAAAAAB8gIBAAAAAfMCIAAAAAH0AgIAAAABEgQAAMMFACAHAAD4BQAgCQAAxAUAIA4AAMUFACAQAADGBQAgqAIBAAAAAasCQAAAAAHPAgEAAAAB0wIBAAAAAfACAAAAgAMC8gIBAAAAAfoCAAAA-gIC_AIAAAD8AgL9AggAAAAB_gICAAAAAYADAQAAAAGBAwEAAAABggMBAAAAAQIAAAAJACApAADtBwAgAwAAAAcAICkAAO0HACAqAADxBwAgFAAAAAcAIAQAAPkEACAHAAD3BQAgCQAA-gQAIA4AAPsEACAQAAD8BAAgIgAA8QcAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIYIDAQC7BAAhEgQAAPkEACAHAAD3BQAgCQAA-gQAIA4AAPsEACAQAAD8BAAgqAIBALMEACGrAkAAtAQAIc8CAQCzBAAh0wIBALMEACHwAgAA9wSAAyLyAgEAuwQAIfoCAAD1BPoCIvwCAAD2BPwCIv0CCADVBAAh_gICAMoEACGAAwEAuwQAIYEDAQC7BAAhggMBALsEACEB3wIBAAAAARIEAADDBQAgBwAA-AUAIAkAAMQFACAOAADFBQAgEQAAxwUAIKgCAQAAAAGrAkAAAAABzwIBAAAAAdMCAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAYIDAQAAAAECAAAACQAgKQAA8wcAIAMAAAAHACApAADzBwAgKgAA9wcAIBQAAAAHACAEAAD5BAAgBwAA9wUAIAkAAPoEACAOAAD7BAAgEQAA_QQAICIAAPcHACCoAgEAswQAIasCQAC0BAAhzwIBALMEACHTAgEAswQAIfACAAD3BIADIvICAQC7BAAh-gIAAPUE-gIi_AIAAPYE_AIi_QIIANUEACH-AgIAygQAIYADAQC7BAAhgQMBALsEACGCAwEAuwQAIRIEAAD5BAAgBwAA9wUAIAkAAPoEACAOAAD7BAAgEQAA_QQAIKgCAQCzBAAhqwJAALQEACHPAgEAswQAIdMCAQCzBAAh8AIAAPcEgAMi8gIBALsEACH6AgAA9QT6AiL8AgAA9gT8AiL9AggA1QQAIf4CAgDKBAAhgAMBALsEACGBAwEAuwQAIYIDAQC7BAAhAd4CAQAAAAEDAAAALwAgKQAA4wcAICoAAPsHACAMAAAALwAgAwAA_gUAIBIAAIAGACATAACBBgAgIgAA-wcAIKgCAQCzBAAhqwJAALQEACGsAgEAswQAIfMCIADWBAAhgwMCAMoEACGEAwEAswQAIYUDAgDKBAAhCgMAAP4FACASAACABgAgEwAAgQYAIKgCAQCzBAAhqwJAALQEACGsAgEAswQAIfMCIADWBAAhgwMCAMoEACGEAwEAswQAIYUDAgDKBAAhDKgCAQAAAAGrAkAAAAABzwIBAAAAAdMCAQAAAAHwAgAAAIADAvICAQAAAAH6AgAAAPoCAvwCAAAA_AIC_QIIAAAAAf4CAgAAAAGAAwEAAAABgQMBAAAAAQMAAABVACApAADhBwAgKgAA_wcAIA8AAABVACATAACqBgAgFQAAqwYAIBYAAKwGACAXAACtBgAgGAAArgYAIBkAAK8GACAbAACxBgAgHAAAsgYAICIAAP8HACCoAgEAswQAIasCQAC0BAAhxgIBALMEACHPAgEAswQAIYYDAQCzBAAhDRMAAKoGACAVAACrBgAgFgAArAYAIBcAAK0GACAYAACuBgAgGQAArwYAIBsAALEGACAcAACyBgAgqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQoDAACjBgAgBQAApAYAIBMAAKYGACCoAgEAAAABqwJAAAAAAawCAQAAAAHzAiAAAAABgwMCAAAAAYQDAQAAAAGFAwIAAAABAgAAADEAICkAAIAIACANEwAAmQcAIBUAAJoHACAXAACcBwAgGAAAnQcAIBkAAJ4HACAaAACfBwAgGwAAoAcAIBwAAKEHACCoAgEAAAABqwJAAAAAAcYCAQAAAAHPAgEAAAABhgMBAAAAAQIAAAABACApAACCCAAgAwAAAC8AICkAAIAIACAqAACGCAAgDAAAAC8AIAMAAP4FACAFAAD_BQAgEwAAgQYAICIAAIYIACCoAgEAswQAIasCQAC0BAAhrAIBALMEACHzAiAA1gQAIYMDAgDKBAAhhAMBALMEACGFAwIAygQAIQoDAAD-BQAgBQAA_wUAIBMAAIEGACCoAgEAswQAIasCQAC0BAAhrAIBALMEACHzAiAA1gQAIYMDAgDKBAAhhAMBALMEACGFAwIAygQAIQMAAABVACApAACCCAAgKgAAiQgAIA8AAABVACATAACqBgAgFQAAqwYAIBcAAK0GACAYAACuBgAgGQAArwYAIBoAALAGACAbAACxBgAgHAAAsgYAICIAAIkIACCoAgEAswQAIasCQAC0BAAhxgIBALMEACHPAgEAswQAIYYDAQCzBAAhDRMAAKoGACAVAACrBgAgFwAArQYAIBgAAK4GACAZAACvBgAgGgAAsAYAIBsAALEGACAcAACyBgAgqAIBALMEACGrAkAAtAQAIcYCAQCzBAAhzwIBALMEACGGAwEAswQAIQ0VAACaBwAgFgAAmwcAIBcAAJwHACAYAACdBwAgGQAAngcAIBoAAJ8HACAbAACgBwAgHAAAoQcAIKgCAQAAAAGrAkAAAAABxgIBAAAAAc8CAQAAAAGGAwEAAAABAgAAAAEAICkAAIoIACAKAwAAowYAIAUAAKQGACASAAClBgAgqAIBAAAAAasCQAAAAAGsAgEAAAAB8wIgAAAAAYMDAgAAAAGEAwEAAAABhQMCAAAAAQIAAAAxACApAACMCAAgAwAAAFUAICkAAIoIACAqAACQCAAgDwAAAFUAIBUAAKsGACAWAACsBgAgFwAArQYAIBgAAK4GACAZAACvBgAgGgAAsAYAIBsAALEGACAcAACyBgAgIgAAkAgAIKgCAQCzBAAhqwJAALQEACHGAgEAswQAIc8CAQCzBAAhhgMBALMEACENFQAAqwYAIBYAAKwGACAXAACtBgAgGAAArgYAIBkAAK8GACAaAACwBgAgGwAAsQYAIBwAALIGACCoAgEAswQAIasCQAC0BAAhxgIBALMEACHPAgEAswQAIYYDAQCzBAAhAwAAAC8AICkAAIwIACAqAACTCAAgDAAAAC8AIAMAAP4FACAFAAD_BQAgEgAAgAYAICIAAJMIACCoAgEAswQAIasCQAC0BAAhrAIBALMEACHzAiAA1gQAIYMDAgDKBAAhhAMBALMEACGFAwIAygQAIQoDAAD-BQAgBQAA_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_MABAQQA9QgA-AAAAAAAFBgA8LwA_MABAQQA9QgA-AQMAAQEDAAEDBgBFLwBGMABHAAAAAwYARS8ARjAARwIKAAgMAAoCCgAIDAAKBQYATC8ATzAAUEEATUIATgAAAAAABQYATC8ATzAAUEEATUIATgIIAAQPAAQCCAAEDwAEAwYAVS8AVjAAVwAAAAMGAFUvAFYwAFcBAwABAQMAAQUGAFwvAF8wAGBBAF1CAF4AAAAAAAUGAFwvAF8wAGBBAF1CAF4CAwABBAADAgMAAQQAAwUGAGUvAGgwAGlBAGZCAGcAAAAAAAUGAGUvAGgwAGlBAGZCAGcCAwABFAADAgMAARQAAwUGAG4vAHEwAHJBAG9CAHAAAAAAAAUGAG4vAHEwAHJBAG9CAHABAwABAQMAAQMGAHcvAHgwAHkAAAADBgB3LwB4MAB5AAAABQYAfy8AggEwAIMBQQCAAUIAgQEAAAAAAAUGAH8vAIIBMACDAUEAgAFCAIEBAQMAAQEDAAEDBgCIAS8AiQEwAIoBAAAAAwYAiAEvAIkBMACKAQEDAAEBAwABAwYAjwEvAJABMACRAQAAAAMGAI8BLwCQATAAkQEBAwABAQMAAQMGAJYBLwCXATAAmAEAAAADBgCWAS8AlwEwAJgBHQIBHlQBH1cBIFgBIVkBI1sBJF0WJV4XJmABJ2IWKGMYK2QBLGUBLWYWMWkZMmodM2sDNGwDNW0DNm4DN28DOHEDOXMWOnQeO3YDPHgWPXkfPnoDP3sDQHwWQ38gRIABJkWBAQRGggEER4MBBEiEAQRJhQEESocBBEuJARZMigEnTY0BBE6PARZPkAEoUJIBBFGTAQRSlAEWU5cBKVSYAS9VmQEHVpoBB1ebAQdYnAEHWZ0BB1qfAQdboQEWXKIBMF2kAQdepgEWX6cBMWCoAQdhqQEHYqoBFmOtATJkrgE4Za8BCGawAQhnsQEIaLIBCGmzAQhqtQEIa7cBFmy4ATltugEIbrwBFm-9ATpwvgEIcb8BCHLAARZzwwE7dMQBQXXFAQp2xgEKd8cBCnjIAQp5yQEKessBCnvNARZ8zgFCfdABCn7SARZ_0wFDgAHUAQqBAdUBCoIB1gEWgwHZAUSEAdoBSIUB2wEJhgHcAQmHAd0BCYgB3gEJiQHfAQmKAeEBCYsB4wEWjAHkAUmNAeYBCY4B6AEWjwHpAUqQAeoBCZEB6wEJkgHsARaTAe8BS5QB8AFRlQHxAQ2WAfIBDZcB8wENmAH0AQ2ZAfUBDZoB9wENmwH5ARacAfoBUp0B_AENngH-ARafAf8BU6ABgAINoQGBAg2iAYICFqMBhQJUpAGGAlilAYcCBaYBiAIFpwGJAgWoAYoCBakBiwIFqgGNAgWrAY8CFqwBkAJZrQGSAgWuAZQCFq8BlQJasAGWAgWxAZcCBbIBmAIWswGbAlu0AZwCYbUBnQIPtgGeAg-3AZ8CD7gBoAIPuQGhAg-6AaMCD7sBpQIWvAGmAmK9AagCD74BqgIWvwGrAmPAAawCD8EBrQIPwgGuAhbDAbECZMQBsgJqxQGzAgLGAbQCAscBtQICyAG2AgLJAbcCAsoBuQICywG7AhbMAbwCa80BvgICzgHAAhbPAcECbNABwgIC0QHDAgLSAcQCFtMBxwJt1AHIAnPVAckCEdYBygIR1wHLAhHYAcwCEdkBzQIR2gHPAhHbAdECFtwB0gJ03QHUAhHeAdYCFt8B1wJ14AHYAhHhAdkCEeIB2gIW4wHdAnbkAd4CeuUB4AJ75gHhAnvnAeQCe-gB5QJ76QHmAnvqAegCe-sB6gIW7AHrAnztAe0Ce-4B7wIW7wHwAn3wAfECe_EB8gJ78gHzAhbzAfYCfvQB9wKEAfUB-AIS9gH5AhL3AfoCEvgB-wIS-QH8AhL6Af4CEvsBgAMW_AGBA4UB_QGDAxL-AYUDFv8BhgOGAYAChwMSgQKIAxKCAokDFoMCjAOHAYQCjQOLAYUCjgMThgKPAxOHApADE4gCkQMTiQKSAxOKApQDE4sClgMWjAKXA4wBjQKZAxOOApsDFo8CnAONAZACnQMTkQKeAxOSAp8DFpMCogOOAZQCowOSAZUCpAMUlgKlAxSXAqYDFJgCpwMUmQKoAxSaAqoDFJsCrAMWnAKtA5MBnQKvAxSeArEDFp8CsgOUAaACswMUoQK0AxSiArUDFqMCuAOVAaQCuQOZAQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/config/prisma.ts
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });
var prisma_default = prisma;

// src/repositories/auth.repo.ts
import { compare, hash } from "bcrypt";
import { randomBytes, createHash } from "crypto";
var BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
var VALID_OTP_PURPOSES = ["reset_password"];
var isValidOtpPurpose = (value) => VALID_OTP_PURPOSES.includes(value);
var createUser = async (data) => {
  const isExisted = await prisma_default.user.findUnique({
    where: { email: data.email }
  });
  if (isExisted) {
    throw createHttpError.Conflict("This email has been used");
  }
  const hashedPassword = await hash(data.password, BCRYPT_ROUNDS);
  return await prisma_default.user.create({
    data: { ...data, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true
    }
  });
};
var findUserByEmailAndPassword = async (data) => {
  const user = await prisma_default.user.findUnique({
    where: { email: data.email }
  });
  if (!user) throw createHttpError.Unauthorized("Invalid User or Password");
  const isMatched = await compare(data.password, user.password);
  if (!isMatched)
    throw createHttpError.Unauthorized("Invalid User or Password");
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
var findUsers = async (data) => {
  return await prisma_default.user.findMany({
    where: {
      ...data
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true
    }
  });
};
var findUserById = async (id) => prisma_default.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true, created_at: true }
});
var updateUserProfile = async (id, data) => prisma_default.user.update({
  where: { id },
  data,
  select: { id: true, name: true, email: true, created_at: true }
});
var changeUserPassword = async (id, currentPassword, newPassword) => {
  const user = await prisma_default.user.findUnique({ where: { id } });
  if (!user || !await compare(currentPassword, user.password)) {
    throw createHttpError.Unauthorized("Current password is incorrect");
  }
  const password = await hash(newPassword, BCRYPT_ROUNDS);
  await prisma_default.$transaction([
    prisma_default.user.update({ where: { id }, data: { password } }),
    prisma_default.refreshSession.updateMany({
      where: { user_id: id, revoked_at: null },
      data: { revoked_at: /* @__PURE__ */ new Date() }
    }),
    prisma_default.passwordResetToken.deleteMany({ where: { user_id: id } })
  ]);
};
var deleteUserAccount = async (id, password) => {
  const user = await prisma_default.user.findUnique({ where: { id } });
  if (!user || !await compare(password, user.password)) {
    throw createHttpError.Unauthorized("Password is incorrect");
  }
  await prisma_default.user.delete({ where: { id } });
};
var createOTP = async (email, otp) => {
  await prisma_default.otp.deleteMany({
    where: {
      email,
      purpose: "reset_password"
    }
  });
  const hashedOtp = await hash(otp, BCRYPT_ROUNDS);
  await prisma_default.otp.create({
    data: {
      email,
      otp: hashedOtp,
      purpose: "reset_password",
      expires_at: new Date(Date.now() + 15 * 60 * 1e3)
    }
  });
};
var verifyOTP = async (email, otp, purpose) => {
  const user = await prisma_default.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError.NotFound("User not found");
  }
  const otpRecord = await prisma_default.otp.findUnique({
    where: {
      email_purpose: { email, purpose }
    }
  });
  if (!otpRecord) {
    throw createHttpError.NotFound("Invalid or expired OTP");
  }
  if (otpRecord.attempts >= 5) {
    throw createHttpError.TooManyRequests("Too many failed attempts");
  }
  if (otpRecord.expires_at < /* @__PURE__ */ new Date()) {
    await prisma_default.otp.delete({ where: { id: otpRecord.id } });
    throw createHttpError.BadRequest("OTP has expired");
  }
  const isMatched = await compare(otp, otpRecord.otp);
  if (!isMatched) {
    await prisma_default.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } }
    });
    throw createHttpError.BadRequest("Invalid OTP");
  }
  await prisma_default.otp.delete({ where: { id: otpRecord.id } });
  await prisma_default.passwordResetToken.deleteMany({
    where: { user_id: user.id }
  });
  const resetToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(resetToken).digest("hex");
  await prisma_default.passwordResetToken.create({
    data: {
      token: tokenHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1e3),
      user_id: user.id
    }
  });
  return resetToken;
};
var updatePassword = async (token, newPassword) => {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const resetTokenRecord = await prisma_default.passwordResetToken.findUnique({
    where: { token: tokenHash }
  });
  if (!resetTokenRecord) {
    throw createHttpError.NotFound("Invalid or expired reset token");
  }
  if (resetTokenRecord.expires_at < /* @__PURE__ */ new Date()) {
    await prisma_default.passwordResetToken.delete({
      where: { id: resetTokenRecord.id }
    });
    throw createHttpError.BadRequest("Reset token has expired");
  }
  const user = await prisma_default.user.findUnique({
    where: { id: resetTokenRecord.user_id }
  });
  if (!user) {
    throw createHttpError.NotFound("User not found");
  }
  const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS);
  await prisma_default.$transaction([
    prisma_default.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    }),
    prisma_default.passwordResetToken.deleteMany({
      where: { user_id: user.id }
    }),
    prisma_default.refreshSession.updateMany({
      where: { user_id: user.id, revoked_at: null },
      data: { revoked_at: /* @__PURE__ */ new Date() }
    })
  ]);
  return { message: "Password reset successful" };
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import ms from "ms";
var SECRET = {
  access: process.env.ACCESS_SECRET_KEY
};
var EXPIRES_IN = {
  access: Math.floor(ms("1h") / 1e3)
};
var signToken = (payload) => {
  return jwt.sign(payload, SECRET.access, {
    expiresIn: EXPIRES_IN.access
  });
};
var verifyToken = (token) => {
  return jwt.verify(token, SECRET.access);
};

// src/config/logger.ts
import winston from "winston";
var { combine, timestamp, errors, colorize, printf } = winston.format;
var customFormat = printf(({ level, message, timestamp: timestamp2, stack }) => {
  const base = `${timestamp2} [${level}]: ${message}`;
  return stack ? `${base}
${stack}` : base;
});
var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "http",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});
var logger_default = logger;

// src/utils/mail.ts
import nodemailer from "nodemailer";
var transporter;
var getMailConfig = () => {
  const user = process.env.EMAIL_USER?.trim();
  const password = process.env.EMAIL_PASSWORD;
  if (!user || !password) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_PASSWORD."
    );
  }
  return { user, password };
};
var getTransporter = () => {
  if (!transporter) {
    const { user, password } = getMailConfig();
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: password
      }
    });
  }
  return transporter;
};
var sendEmail = async ({
  to,
  subject,
  html
}) => {
  const { user } = getMailConfig();
  await getTransporter().sendMail({
    from: `"Academic Planner" <${user}>`,
    to,
    subject,
    html
  });
};

// src/services/auth.services.ts
import crypto from "crypto";

// src/repositories/session.repo.ts
import createHttpError2 from "http-errors";
import { createHash as createHash2, randomBytes as randomBytes2, randomUUID } from "crypto";
var SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1e3;
var SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1e3;
var hashToken = (token) => createHash2("sha256").update(token).digest("hex");
var newToken = () => {
  const id = randomUUID();
  const raw2 = `${id}.${randomBytes2(32).toString("hex")}`;
  return { id, raw: raw2, hash: hashToken(raw2) };
};
var createRefreshSession = async (userId3, metadata) => {
  const token = newToken();
  await prisma_default.refreshSession.create({
    data: {
      id: token.id,
      token_hash: token.hash,
      family_id: randomUUID(),
      expires_at: new Date(Date.now() + SESSION_LIFETIME_MS),
      ...metadata.deviceInfo ? { device_info: metadata.deviceInfo } : {},
      ...metadata.ipAddress ? { ip_address: metadata.ipAddress } : {},
      user_id: userId3
    }
  });
  return token.raw;
};
var rotateRefreshSession = async (rawToken, metadata) => {
  const session = await prisma_default.refreshSession.findUnique({
    where: { token_hash: hashToken(rawToken) },
    include: {
      user: {
        select: { id: true, name: true, email: true, created_at: true }
      }
    }
  });
  if (!session) throw createHttpError2.Unauthorized("Invalid refresh token");
  if (session.revoked_at) {
    await prisma_default.refreshSession.updateMany({
      where: { family_id: session.family_id, revoked_at: null },
      data: { revoked_at: /* @__PURE__ */ new Date() }
    });
    throw createHttpError2.Unauthorized("Refresh token reuse detected");
  }
  const now = /* @__PURE__ */ new Date();
  const idleDeadline = new Date(session.last_used_at.getTime() + SESSION_IDLE_MS);
  if (session.expires_at <= now || idleDeadline <= now) {
    await prisma_default.refreshSession.update({
      where: { id: session.id },
      data: { revoked_at: now }
    });
    throw createHttpError2.Unauthorized("Refresh session expired");
  }
  const next = newToken();
  await prisma_default.$transaction([
    prisma_default.refreshSession.update({
      where: { id: session.id },
      data: { revoked_at: now, last_used_at: now }
    }),
    prisma_default.refreshSession.create({
      data: {
        id: next.id,
        token_hash: next.hash,
        family_id: session.family_id,
        expires_at: session.expires_at,
        ...metadata.deviceInfo ? { device_info: metadata.deviceInfo } : {},
        ...metadata.ipAddress ? { ip_address: metadata.ipAddress } : {},
        user_id: session.user_id
      }
    })
  ]);
  return { refreshToken: next.raw, user: session.user };
};
var revokeRefreshSession = async (userId3, rawToken) => {
  const session = await prisma_default.refreshSession.findUnique({
    where: { token_hash: hashToken(rawToken) },
    select: { user_id: true, family_id: true }
  });
  if (!session || session.user_id !== userId3) return;
  await prisma_default.refreshSession.updateMany({
    where: { user_id: userId3, family_id: session.family_id, revoked_at: null },
    data: { revoked_at: /* @__PURE__ */ new Date() }
  });
};
var revokeAllRefreshSessions = async (userId3) => {
  await prisma_default.refreshSession.updateMany({
    where: { user_id: userId3, revoked_at: null },
    data: { revoked_at: /* @__PURE__ */ new Date() }
  });
};

// src/services/auth.services.ts
var registerUser = async (name, password, email, metadata = {}) => {
  const user = await createUser({ name, password, email });
  const access_token = await signToken(
    { user_id: user.id, email: user.email }
  );
  const refresh_token = await createRefreshSession(user.id, metadata);
  logger_default.info(`New user registered: ${email}`);
  return { user, access_token, refresh_token };
};
var loginUser = async (email, password, metadata = {}) => {
  const user = await findUserByEmailAndPassword({ email, password });
  const access_token = await signToken(
    { user_id: user.id, email: user.email }
  );
  const refresh_token = await createRefreshSession(user.id, metadata);
  logger_default.info(`User logged in: ${email}`);
  return { user, access_token, refresh_token };
};
var getUserById = async (id) => {
  const user = await findUserById(id);
  logger_default.info(`Retrieved user: ${id}`);
  return user;
};
var updateProfile = async (userId3, data) => updateUserProfile(userId3, data);
var changePassword = async (userId3, currentPassword, newPassword) => {
  await changeUserPassword(userId3, currentPassword, newPassword);
  return { message: "Password changed successfully" };
};
var deleteAccount = async (userId3, password) => {
  await deleteUserAccount(userId3, password);
};
var refreshToken = async (refreshTokenValue, metadata = {}) => {
  const { refreshToken: rotatedToken, user } = await rotateRefreshSession(
    refreshTokenValue,
    metadata
  );
  const access_token = signToken({ user_id: user.id, email: user.email });
  logger_default.info(`Token refreshed for user: ${user.email}`);
  return { access_token, refresh_token: rotatedToken, user };
};
var logoutUser = revokeRefreshSession;
var logoutAllSessions = revokeAllRefreshSessions;
var requestResetPassword = async (email) => {
  const users = await findUsers({ email });
  if (users.length === 0) {
    return {
      message: "If an account with that email exists, a reset code has been sent."
    };
  }
  const otp = crypto.randomInt(1e5, 1e6).toString();
  await createOTP(email, otp);
  await sendEmail({
    to: email,
    subject: "Password Reset Code",
    html: `
      <h2>Password Reset</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 15 minutes.</p>
    `
  });
  return {
    message: "If an account with that email exists, a reset code has been sent."
  };
};
var checkOTP = async (email, otp, purpose) => {
  return await verifyOTP(email, otp, purpose);
};
var resetPassword = async (resetToken, newPassword) => {
  return await updatePassword(resetToken, newPassword);
};

// src/controllers/auth.controller.ts
var handleRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw createHttpError4.BadRequest("Name, email and password are required");
    }
    const { user, access_token, refresh_token } = await registerUser(
      name,
      password,
      email,
      { deviceInfo: req.get("user-agent"), ipAddress: req.ip }
    );
    return res.status(201).json({
      message: "User registered successfully",
      user,
      access_token,
      refresh_token
    });
  } catch (error) {
    next(error);
  }
};
var handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError4.BadRequest("Email and password are required");
    }
    const { user, access_token, refresh_token } = await loginUser(
      email,
      password,
      { deviceInfo: req.get("user-agent"), ipAddress: req.ip }
    );
    return res.status(200).json({
      message: "Login successful",
      user,
      access_token,
      refresh_token
    });
  } catch (error) {
    next(error);
  }
};
var handleRefreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw createHttpError4.BadRequest("Invalid token");
    }
    const { access_token, refresh_token, user } = await refreshToken(token, {
      deviceInfo: req.get("user-agent"),
      ipAddress: req.ip
    });
    return res.status(200).json({
      message: "Token refreshed successfully",
      access_token,
      refresh_token,
      user
    });
  } catch (error) {
    next(error);
  }
};
var handleRequestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const result = await requestResetPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
var handleVerifyOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp || !purpose) {
      return res.status(400).json({
        message: "Email, OTP, and purpose are required"
      });
    }
    if (!isValidOtpPurpose(purpose)) {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }
    const resetToken = await checkOTP(email, otp, purpose);
    return res.status(200).json({
      message: "OTP verified successfully",
      reset_token: resetToken
    });
  } catch (error) {
    next(error);
  }
};
var handleResetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }
    const result = await resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
var handleLogout = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    const { refresh_token } = req.body;
    if (!refresh_token) throw createHttpError4.BadRequest("Refresh token is required");
    await logoutUser(req.user.user_id, refresh_token);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
var handleLogoutAll = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    await logoutAllSessions(req.user.user_id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
var handleGetProfile = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    const user = await getUserById(req.user.user_id);
    if (!user) throw createHttpError4.NotFound("User not found");
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
var handleUpdateProfile = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    const user = await updateProfile(req.user.user_id, req.body);
    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};
var handleChangePassword = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    const result = await changePassword(
      req.user.user_id,
      req.body.current_password,
      req.body.new_password
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
var handleDeleteAccount = async (req, res, next) => {
  try {
    if (!req.user) throw createHttpError4.Unauthorized();
    await deleteAccount(req.user.user_id, req.body.password);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// src/middleware/middleware.ts
import createHttpError5 from "http-errors";
import { randomUUID as randomUUID2 } from "crypto";
var requestIdMiddleware = (req, res, next) => {
  const supplied = req.get("x-request-id");
  req.requestId = supplied?.slice(0, 100) || randomUUID2();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};
var authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError5.Unauthorized("Invalid authorization format");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw createHttpError5.Unauthorized("Invalid authorization format");
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    logger_default.warn(`Unauthorized access attempt - ${req.method} ${req.url}`);
    next(createHttpError5.Unauthorized("Invalid token"));
  }
};

// src/middleware/validate.middleware.ts
import createHttpError6 from "http-errors";
var validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body";
      return next(createHttpError6.BadRequest(message));
    }
    req.body = result.data;
    next();
  };
};

// src/middleware/rate-limit.middleware.ts
import { createHash as createHash3 } from "crypto";
import createHttpError7 from "http-errors";
var buckets = /* @__PURE__ */ new Map();
var emailKey = (req) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  return createHash3("sha256").update(email.trim().toLowerCase()).digest("hex");
};
var createRateLimit = (options) => (req, res, next) => {
  const now = Date.now();
  if (buckets.size > 1e4) {
    for (const [key2, bucket2] of buckets) {
      if (bucket2.resetAt <= now) buckets.delete(key2);
    }
  }
  const identity = options.includeEmail ? `${req.ip}:${emailKey(req)}` : req.ip;
  const key = `${req.baseUrl}${req.path}:${identity}`;
  const existing = buckets.get(key);
  const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + options.windowMs } : existing;
  bucket.count += 1;
  buckets.set(key, bucket);
  res.setHeader("RateLimit-Limit", options.max);
  res.setHeader("RateLimit-Remaining", Math.max(0, options.max - bucket.count));
  res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1e3));
  if (bucket.count > options.max) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1e3));
    return next(createHttpError7.TooManyRequests("Too many requests"));
  }
  next();
};

// src/utils/auth.validator.ts
import { z as z2 } from "zod";
var passwordSchema = z2.string().min(8, "Password must be between 8 and 32 characters long").max(32, "Password must be between 8 and 32 characters long");
var registerSchema = z2.object({
  name: z2.string().trim().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long"),
  email: z2.string().trim().email("Invalid email address"),
  password: passwordSchema
});
var loginSchema = z2.object({
  email: z2.string().trim().email("Invalid email address"),
  password: z2.string().min(1).max(72)
});
var requestPasswordResetSchema = z2.object({
  email: z2.string().trim().email("Invalid email address")
});
var verifyOtpSchema = z2.object({
  email: z2.string().trim().email("Invalid email address"),
  otp: z2.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  purpose: z2.literal("reset_password")
});
var resetPasswordSchema = z2.object({
  token: z2.string().regex(/^[a-f0-9]{64}$/i, "Invalid password-reset token"),
  newPassword: passwordSchema
});
var logoutSchema = z2.object({
  refresh_token: z2.string().min(32).max(200)
});
var updateProfileSchema = z2.object({
  name: z2.string().trim().min(2).max(100).optional(),
  email: z2.string().trim().email().optional()
}).strict().refine((data) => Object.keys(data).length > 0, "At least one field is required");
var changePasswordSchema = z2.object({
  current_password: z2.string().min(1).max(72),
  new_password: passwordSchema
});
var deleteAccountSchema = z2.object({
  password: z2.string().min(1).max(72)
});

// src/routes/auth.routes.ts
var authRouter = Router();
var authAttemptLimit = createRateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  includeEmail: true
});
var recoveryLimit = createRateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  includeEmail: true
});
var refreshLimit = createRateLimit({ windowMs: 60 * 1e3, max: 30 });
authRouter.post("/register", authAttemptLimit, validate(registerSchema), handleRegister);
authRouter.post("/login", authAttemptLimit, validate(loginSchema), handleLogin);
authRouter.post("/refresh-token", refreshLimit, handleRefreshToken);
authRouter.post("/logout", authMiddleware, validate(logoutSchema), handleLogout);
authRouter.post("/logout-all", authMiddleware, handleLogoutAll);
authRouter.get("/me", authMiddleware, handleGetProfile);
authRouter.patch("/me", authMiddleware, validate(updateProfileSchema), handleUpdateProfile);
authRouter.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  handleChangePassword
);
authRouter.delete(
  "/me",
  authMiddleware,
  validate(deleteAccountSchema),
  handleDeleteAccount
);
authRouter.post(
  "/request-password-reset",
  recoveryLimit,
  validate(requestPasswordResetSchema),
  handleRequestPasswordReset
);
authRouter.post(
  "/reset-password",
  recoveryLimit,
  validate(resetPasswordSchema),
  handleResetPassword
);
authRouter.post("/verify-otp", recoveryLimit, validate(verifyOtpSchema), handleVerifyOTP);
var auth_routes_default = authRouter;

// src/routes/semester.routes.ts
import { Router as Router2 } from "express";

// src/controllers/semester.controller.ts
import createHttpError10 from "http-errors";

// src/services/semester.services.ts
import createHttpError9 from "http-errors";

// src/repositories/semester.repo.ts
var findSemesters = async (data) => {
  return await prisma_default.semester.findMany({
    where: { user_id: data.user_id },
    include: { courses: true, gpas: true }
  });
};
var findSemesterById = async (data) => {
  return await prisma_default.semester.findUnique({
    where: { id: data.id },
    include: { courses: true, gpas: true }
  });
};

// src/services/gpa.services.ts
import createHttpError8 from "http-errors";

// src/utils/gpa-calculator.ts
var calculateSemesterMetrics = (courses) => {
  const actual = courses.filter((course) => course.type === "ACTUAL");
  const sum = (items) => ({
    credits: items.reduce((total, course) => total + course.credit, 0),
    points: items.reduce(
      (total, course) => total + course.grade_point * course.credit,
      0
    )
  });
  const actualTotals = sum(actual);
  const projectedTotals = sum(courses);
  const rounded2 = (value) => Number(value.toFixed(2));
  return {
    actualCredits: actualTotals.credits,
    actualPoints: actualTotals.points,
    actualGpa: actualTotals.credits ? rounded2(actualTotals.points / actualTotals.credits) : 0,
    projectedCredits: projectedTotals.credits,
    projectedPoints: projectedTotals.points,
    projectedGpa: projectedTotals.credits ? rounded2(projectedTotals.points / projectedTotals.credits) : 0
  };
};

// src/services/gpa.services.ts
var rounded = (value) => Number(value.toFixed(2));
var recalculateUserGpas = async (userId3, db = prisma_default) => {
  const semesters = await db.semester.findMany({
    where: { user_id: userId3 },
    orderBy: [{ year: "asc" }, { term_no: "asc" }],
    include: { courses: true }
  });
  let cumulativeCredits = 0;
  let cumulativeGradePoints = 0;
  for (const semester of semesters) {
    const metrics = calculateSemesterMetrics(semester.courses);
    cumulativeCredits += metrics.actualCredits;
    cumulativeGradePoints += metrics.actualPoints;
    await db.gPA.upsert({
      where: {
        user_id_semester_id: { user_id: userId3, semester_id: semester.id }
      },
      create: {
        user_id: userId3,
        semester_id: semester.id,
        gpa: metrics.actualGpa,
        cum_gpa: cumulativeCredits ? rounded(cumulativeGradePoints / cumulativeCredits) : 0,
        total_credits: metrics.actualCredits,
        total_grade_points: metrics.actualPoints,
        projected_gpa: metrics.projectedGpa,
        projected_total_credits: metrics.projectedCredits,
        projected_total_grade_points: metrics.projectedPoints
      },
      update: {
        gpa: metrics.actualGpa,
        cum_gpa: cumulativeCredits ? rounded(cumulativeGradePoints / cumulativeCredits) : 0,
        total_credits: metrics.actualCredits,
        total_grade_points: metrics.actualPoints,
        projected_gpa: metrics.projectedGpa,
        projected_total_credits: metrics.projectedCredits,
        projected_total_grade_points: metrics.projectedPoints,
        calculated_at: /* @__PURE__ */ new Date()
      }
    });
  }
};
var withAliases = (record) => ({
  ...record,
  actual_gpa: record.gpa,
  actual_credits: record.total_credits,
  actual_grade_points: record.total_grade_points
});
var getGPABySemesterId = async (semesterId, userId3) => {
  const semester = await prisma_default.semester.findFirst({
    where: { id: semesterId, user_id: userId3 }
  });
  if (!semester) throw createHttpError8.NotFound("Semester not found");
  const gpa = await prisma_default.gPA.findUnique({
    where: { user_id_semester_id: { user_id: userId3, semester_id: semesterId } }
  });
  logger_default.info(`Retrieved GPA for semester ${semesterId} for user ${userId3}`);
  return gpa ? withAliases(gpa) : null;
};
var getGPAByUserId = async (userId3) => {
  const gpas = await prisma_default.gPA.findMany({ where: { user_id: userId3 } });
  logger_default.info(`Retrieved all GPAs for user ${userId3}`);
  return gpas.map(withAliases);
};

// src/services/semester.services.ts
var addSemester = async (data) => {
  const semester = await prisma_default.$transaction(async (tx) => {
    const semesterExists = await tx.semester.findFirst({
      where: {
        year: data.year,
        term_no: data.term_no,
        user_id: data.user_id
      }
    });
    if (semesterExists) throw createHttpError9.Conflict("Semester already exists");
    const created = await tx.semester.create({ data });
    await recalculateUserGpas(data.user_id, tx);
    return tx.semester.findUniqueOrThrow({
      where: { id: created.id },
      include: { courses: true, gpas: true }
    });
  });
  logger_default.info(
    `Semester added: ${data.year} ${data.term} for user ${data.user_id}`
  );
  return semester;
};
var getSemesters = async (data) => {
  const semesters = await findSemesters(data);
  logger_default.info(
    `Retrieved ${semesters.length} semesters for user ${data.user_id}`
  );
  return semesters;
};
var getSemesterById = async (user_id, data) => {
  const semester = await findSemesterById(data);
  if (!semester) {
    throw createHttpError9.NotFound("Semester not found");
  }
  if (semester.user_id !== user_id) {
    throw createHttpError9.Forbidden(
      "You don't have permission to access this semester"
    );
  }
  logger_default.info(`Retrieved semester ${data.id} for user ${user_id}`);
  return semester;
};
var editSemester = async (data) => {
  const semester = await prisma_default.$transaction(async (tx) => {
    const existing = await tx.semester.findFirst({
      where: { id: data.id, user_id: data.user_id }
    });
    if (!existing) throw createHttpError9.NotFound("Semester not found");
    const year = data.data.year ?? existing.year;
    const termNo = data.data.term_no ?? existing.term_no;
    const duplicate = await tx.semester.findFirst({
      where: {
        year,
        term_no: termNo,
        user_id: data.user_id,
        id: { not: data.id }
      }
    });
    if (duplicate) throw createHttpError9.Conflict("Semester already exists");
    await tx.semester.update({ where: { id: data.id }, data: data.data });
    await recalculateUserGpas(data.user_id, tx);
    return tx.semester.findUniqueOrThrow({
      where: { id: data.id },
      include: { courses: true, gpas: true }
    });
  });
  logger_default.info(
    `Semester edited: ${data.id} for user ${data.user_id} with data: ${JSON.stringify(data.data)}`
  );
  return semester;
};
var removeSemester = async (data) => {
  const semester = await prisma_default.$transaction(async (tx) => {
    const existing = await tx.semester.findFirst({
      where: { id: data.id, user_id: data.user_id }
    });
    if (!existing) throw createHttpError9.NotFound("Semester not found");
    const deleted = await tx.semester.delete({ where: { id: data.id } });
    await recalculateUserGpas(data.user_id, tx);
    return deleted;
  });
  logger_default.info(`Semester removed: ${data.id} for user ${data.user_id}`);
  return semester;
};

// src/controllers/semester.controller.ts
var handleCreateSemester = async (req, res, next) => {
  try {
    const { year, term, is_complete, term_no } = req.body;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError10.Unauthorized("Unauthorized");
    }
    const user_id = user.user_id;
    const semester = await addSemester({
      year,
      term,
      is_complete,
      term_no,
      user_id
    });
    res.status(201).json({
      message: "Create semester successfully",
      semester
    });
  } catch (error) {
    next(error);
  }
};
var handleGetSemesters = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError10.Unauthorized("Unauthorized");
    }
    const user_id = user.user_id;
    const semesters = await getSemesters({ user_id });
    res.status(200).json({
      message: "Get semesters successfully",
      semesters
    });
  } catch (error) {
    next(error);
  }
};
var handleGetSemesterById = async (req, res, next) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError10.Unauthorized("Unauthorized");
    }
    if (semester_id === void 0 || Array.isArray(semester_id)) {
      throw createHttpError10.BadRequest("Missing semester id");
    }
    const semester = await getSemesterById(user.user_id, { id: semester_id });
    if (!semester) {
      throw createHttpError10.NotFound("Semester not found");
    }
    res.status(200).json({
      message: "Get semester successfully",
      semester
    });
  } catch (error) {
    next(error);
  }
};
var handleUpdateSemester = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError10.Unauthorized("Unauthorized");
    }
    const { semester_id } = req.params;
    const { year, term, is_complete, term_no } = req.body;
    if (semester_id === void 0 || Array.isArray(semester_id)) {
      throw createHttpError10.BadRequest("Missing semester id");
    }
    if (!year && !term && is_complete === void 0 && term_no === void 0) {
      throw createHttpError10.BadRequest("Missing data to update");
    }
    const semester = await editSemester({
      id: semester_id,
      user_id: user.user_id,
      data: { year, term, is_complete, term_no }
    });
    res.status(200).json({
      message: "Update semester successfully",
      semester
    });
  } catch (error) {
    next(error);
  }
};
var handleDeleteSemester = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError10.Unauthorized("Unauthorized");
    }
    const { semester_id } = req.params;
    if (semester_id === void 0 || Array.isArray(semester_id)) {
      throw createHttpError10.BadRequest("Missing semester id");
    }
    const semester = await removeSemester({
      id: semester_id,
      user_id: user.user_id
    });
    res.status(200).json({
      message: "Delete semester successfully",
      semester
    });
  } catch (error) {
    next(error);
  }
};

// src/utils/semester.validator.ts
import z3 from "zod";
var semesterFields = {
  year: z3.number().int().min(1900).max(2200),
  term: z3.string().trim().min(1, "Term is required").max(50),
  term_no: z3.number().int().min(1).max(12),
  is_complete: z3.boolean()
};
var createSemesterSchema = z3.object({
  ...semesterFields,
  is_complete: semesterFields.is_complete.default(false)
});
var updateSemesterSchema = z3.object({
  year: semesterFields.year.optional(),
  term: semesterFields.term.optional(),
  term_no: semesterFields.term_no.optional(),
  is_complete: semesterFields.is_complete.optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one semester field is required"
});

// src/routes/semester.routes.ts
var semesterRouter = Router2();
semesterRouter.post(
  "/addSemester",
  authMiddleware,
  validate(createSemesterSchema),
  handleCreateSemester
);
semesterRouter.patch(
  "/updateSemester/:semester_id",
  authMiddleware,
  validate(updateSemesterSchema),
  handleUpdateSemester
);
semesterRouter.delete("/deleteSemester/:semester_id", authMiddleware, handleDeleteSemester);
semesterRouter.get(
  "/getSemesterById/:semester_id",
  authMiddleware,
  handleGetSemesterById
);
semesterRouter.get("/getSemesters", authMiddleware, handleGetSemesters);
var semester_routes_default = semesterRouter;

// src/routes/course.routes.ts
import { Router as Router3 } from "express";

// src/controllers/course.controller.ts
import "express";
import createHttpError12 from "http-errors";

// src/services/course.service.ts
import createHttpError11 from "http-errors";

// src/utils/grade.ts
var gradePointMap = {
  A: 4,
  B_PLUS: 3.5,
  B: 3,
  C_PLUS: 2.5,
  C: 2,
  D_PLUS: 1.5,
  D: 1,
  F: 0
};

// src/services/course.service.ts
var addCourse = async (userId3, data) => {
  const course = await prisma_default.$transaction(async (tx) => {
    const semester = await tx.semester.findFirst({
      where: { id: data.semester_id, user_id: userId3 }
    });
    if (!semester) throw createHttpError11.NotFound("Semester not found");
    const created = await tx.course.create({
      data: { ...data, grade_point: gradePointMap[data.grade] }
    });
    await recalculateUserGpas(userId3, tx);
    return created;
  });
  logger_default.info(`Course added: ${data.name} for user ${userId3}`);
  return course;
};
var editCourse = async (courseId, userId3, data) => {
  const updated = await prisma_default.$transaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: { id: courseId, semester: { user_id: userId3 } }
    });
    if (!course) throw createHttpError11.NotFound("Course not found");
    if (data.semester_id) {
      const target = await tx.semester.findFirst({
        where: { id: data.semester_id, user_id: userId3 }
      });
      if (!target) throw createHttpError11.NotFound("Semester not found");
    }
    const result = await tx.course.update({
      where: { id: courseId },
      data: {
        ...data,
        ...data.grade ? { grade_point: gradePointMap[data.grade] } : {}
      }
    });
    await recalculateUserGpas(userId3, tx);
    return result;
  });
  logger_default.info(`Course updated: ${updated.name} for user ${userId3}`);
  return updated;
};
var getCourseById = async (userId3, data) => {
  const course = await prisma_default.course.findFirst({
    where: { id: data.course_id, semester: { user_id: userId3 } }
  });
  if (!course) throw createHttpError11.NotFound("Course not found");
  return course;
};
var getCoursesBySemesterId = async (userId3, data) => {
  const semester = await prisma_default.semester.findFirst({
    where: { id: data.semester_id, user_id: userId3 }
  });
  if (!semester) throw createHttpError11.NotFound("Semester not found");
  return prisma_default.course.findMany({ where: { semester_id: data.semester_id } });
};
var removeCourse = async (userId3, data) => prisma_default.$transaction(async (tx) => {
  const course = await tx.course.findFirst({
    where: { id: data.course_id, semester: { user_id: userId3 } }
  });
  if (!course) throw createHttpError11.NotFound("Course not found");
  const deleted = await tx.course.delete({ where: { id: data.course_id } });
  await recalculateUserGpas(userId3, tx);
  return deleted;
});
var removeCourseBySemesterId = async (userId3, data) => prisma_default.$transaction(async (tx) => {
  const semester = await tx.semester.findFirst({
    where: { id: data.semester_id, user_id: userId3 }
  });
  if (!semester) throw createHttpError11.NotFound("Semester not found");
  const deleted = await tx.course.deleteMany({
    where: { semester_id: data.semester_id }
  });
  await recalculateUserGpas(userId3, tx);
  return deleted;
});

// src/controllers/course.controller.ts
var handleCreateCourse = async (req, res, next) => {
  try {
    const {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes
    } = req.body;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!name || !grade || !credit || !type || !semester_id || !category) {
      throw createHttpError12.BadRequest("Missing required fields");
    }
    const user_id = user.user_id;
    const course = await addCourse(user_id, {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes
    });
    res.status(201).json({
      message: "Create course successfully",
      course
    });
  } catch (error) {
    next(error);
  }
};
var handleGetCourseById = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError12.BadRequest("Invalid course_id");
    }
    const user_id = user.user_id;
    const course = await getCourseById(user_id, { course_id });
    res.status(200).json({
      message: "Fetch course successfully",
      course
    });
  } catch (error) {
    next(error);
  }
};
var handleGetCourseBySemesterId = async (req, res, next) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError12.BadRequest("Invalid semester_id");
    }
    const user_id = user.user_id;
    const courses = await getCoursesBySemesterId(user_id, { semester_id });
    res.status(200).json({
      message: "Fetch courses successfully",
      courses
    });
  } catch (error) {
    next(error);
  }
};
var handleEditCourse = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes
    } = req.body;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError12.BadRequest("Invalid course_id");
    }
    const user_id = user.user_id;
    const course = await editCourse(course_id, user_id, {
      name,
      grade,
      credit,
      type,
      semester_id,
      category,
      course_code,
      instructor,
      notes
    });
    res.status(200).json({
      message: "Edit course successfully",
      course
    });
  } catch (error) {
    next(error);
  }
};
var handleDeleteCourse = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!course_id || Array.isArray(course_id)) {
      throw createHttpError12.BadRequest("Invalid course_id");
    }
    const user_id = user.user_id;
    const course = await removeCourse(user_id, { course_id });
    res.status(200).json({
      message: "Delete course successfully",
      course
    });
  } catch (error) {
    next(error);
  }
};
var handleDeleteCourseBySemester = async (req, res, next) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;
    if (!user || !user.user_id) {
      throw createHttpError12.Unauthorized("Unauthorized");
    }
    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError12.BadRequest("Invalid semester_id");
    }
    const user_id = user.user_id;
    const courses = await removeCourseBySemesterId(user_id, { semester_id });
    res.status(200).json({
      message: "Delete courses successfully",
      courses
    });
  } catch (error) {
    next(error);
  }
};

// src/utils/course.validator.ts
import z4 from "zod";
var createCourseSchema = z4.object({
  name: z4.string().trim().min(1, "Course name is required").max(200),
  grade: z4.enum(
    ["A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"],
    "Invalid grade"
  ),
  credit: z4.number().int().min(1).max(30),
  type: z4.enum(["ACTUAL", "PLAN"], "Invalid course type"),
  semester_id: z4.uuid("Invalid Semester ID"),
  category: z4.enum(
    ["GEN_ED", "MAJOR_REQUIRED", "MAJOR_ELECTIVE", "MINOR", "FREE_ELECTIVE"],
    "Invalid course category"
  ),
  course_code: z4.string().trim().max(30).nullable().optional(),
  instructor: z4.string().trim().max(100).nullable().optional(),
  notes: z4.string().trim().max(2e3).nullable().optional()
});
var updateCourseSchema = createCourseSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one course field is required"
});

// src/routes/course.routes.ts
var courseRouter = Router3();
courseRouter.post(
  "/createCourse",
  authMiddleware,
  validate(createCourseSchema),
  handleCreateCourse
);
courseRouter.patch(
  "/editCourse/:course_id",
  authMiddleware,
  validate(updateCourseSchema),
  handleEditCourse
);
courseRouter.delete(
  "/deleteCourse/:course_id",
  authMiddleware,
  handleDeleteCourse
);
courseRouter.delete(
  "/deleteCourseBySemesterId/:semester_id",
  authMiddleware,
  handleDeleteCourseBySemester
);
courseRouter.get(
  "/getCoursesBySemesterId/:semester_id",
  authMiddleware,
  handleGetCourseBySemesterId
);
courseRouter.get(
  "/getCourseById/:course_id",
  authMiddleware,
  handleGetCourseById
);
var course_routes_default = courseRouter;

// src/routes/goal.routes.ts
import { Router as Router4 } from "express";

// src/utils/goal.validator.ts
import z5 from "zod";
var createGoalSchema = z5.object({
  name: z5.string().trim().min(1).max(100).optional(),
  target_gpa: z5.number().min(0).max(4),
  target_semester_id: z5.uuid("Invalid Semester ID"),
  is_achieved: z5.boolean().optional()
});
var updateGoalSchema = createGoalSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one goal field is required"
});

// src/services/goal.service.ts
import createHttpError13 from "http-errors";

// src/repositories/goal.repo.ts
var createGoal = async (data) => {
  return await prisma_default.goal.create({ data });
};
var updateGoal = async (id, data) => {
  return await prisma_default.goal.update({ where: { id }, data });
};
var findGoalByUserId = async (user_id) => {
  return await prisma_default.goal.findMany({ where: { user_id } });
};
var findGoalById = async (id) => {
  return await prisma_default.goal.findUnique({ where: { id } });
};
var deleteGoal = async (id) => {
  return await prisma_default.goal.delete({ where: { id } });
};

// src/services/goal.service.ts
import "console";
var addGoal = async (data) => {
  logger_default.info(`Adding goal for user ${data.user_id} with target GPA ${data.target_gpa} for semester ${data.target_semester_id}`);
  return await createGoal(data);
};
var editGoal = async (user_id, goal_id, data) => {
  const goal = await findGoalById(goal_id);
  if (!goal || goal.user_id !== user_id) {
    throw createHttpError13.NotFound("Goal not found");
  }
  logger_default.info(`Editing goal ${goal_id} for user ${user_id} with data: ${JSON.stringify(data)}`);
  return await updateGoal(goal_id, data);
};
var removeGoal = async (user_id, goal_id) => {
  const goal = await findGoalById(goal_id);
  if (!goal || goal.user_id !== user_id) {
    throw createHttpError13.NotFound("Goal not found");
  }
  logger_default.info(`Removing goal ${goal_id} for user ${user_id}`);
  return await deleteGoal(goal_id);
};
var getGoalByUserId = async (user_id) => {
  const goals = await findGoalByUserId(user_id);
  logger_default.info(`Retrieved ${goals.length} goals for user ${user_id}`);
  return goals;
};
var getGoalById = async (user_id, goal_id) => {
  const goal = await findGoalById(goal_id);
  if (!goal || goal.user_id !== user_id) {
    throw createHttpError13.NotFound("Goal not found");
  }
  logger_default.info(`Retrieved goal ${goal_id} for user ${user_id}`);
  return goal;
};

// src/controllers/goal.controller.ts
import createHttpError14 from "http-errors";
var handleAddGoal = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, target_gpa, target_semester_id, is_achieved } = req.body;
    if (!user || !user?.user_id) {
      throw createHttpError14.Unauthorized("User not authenticated");
    }
    if (target_gpa === void 0 || !target_semester_id) {
      throw createHttpError14.BadRequest("Invalid required fields");
    }
    const user_id = user.user_id;
    const goal = await addGoal({
      user_id,
      name,
      target_gpa,
      target_semester_id,
      is_achieved
    });
    res.status(201).json({
      message: "Goal created successfully",
      goal
    });
  } catch (error) {
    next(error);
  }
};
var handleEditGoal = async (req, res, next) => {
  try {
    const user = req.user;
    const { goal_id } = req.params;
    const { name, target_gpa, target_semester_id, is_achieved } = req.body;
    if (!user || !user?.user_id) {
      throw createHttpError14.Unauthorized("User not authenticated");
    }
    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError14.BadRequest("Invalid goal ID");
    }
    const user_id = user.user_id;
    const updatedGoal = await editGoal(user_id, goal_id, {
      name,
      target_gpa,
      target_semester_id,
      is_achieved
    });
    res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal
    });
  } catch (error) {
    next(error);
  }
};
var handleRemoveGoal = async (req, res, next) => {
  try {
    const user = req.user;
    const { goal_id } = req.params;
    if (!user || !user?.user_id) {
      throw createHttpError14.Unauthorized("User not authenticated");
    }
    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError14.BadRequest("Invalid goal ID");
    }
    const user_id = user.user_id;
    const removedGoal = await removeGoal(user_id, goal_id);
    res.status(200).json({
      message: "Goal removed successfully",
      goal: removedGoal
    });
  } catch (error) {
    next(error);
  }
};
var handleGetGoalsByUserId = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user?.user_id) {
      throw createHttpError14.Unauthorized("User not authenticated");
    }
    const user_id = user.user_id;
    const goals = await getGoalByUserId(user_id);
    res.status(200).json({
      message: "Goals retrieved successfully",
      goals
    });
  } catch (error) {
    next(error);
  }
};
var handleGetGoalById = async (req, res, next) => {
  try {
    const user = req.user;
    const { goal_id } = req.params;
    if (!user || !user?.user_id) {
      throw createHttpError14.Unauthorized("User not authenticated");
    }
    if (!goal_id || Array.isArray(goal_id)) {
      throw createHttpError14.BadRequest("Invalid goal ID");
    }
    const user_id = user.user_id;
    const goal = await getGoalById(user_id, goal_id);
    res.status(200).json({
      message: "Goal retrieved successfully",
      goal
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/goal.routes.ts
var goalRouter = Router4();
goalRouter.post(
  "/createGoal",
  authMiddleware,
  validate(createGoalSchema),
  handleAddGoal
);
goalRouter.patch(
  "/updateGoal/:goal_id",
  authMiddleware,
  validate(updateGoalSchema),
  handleEditGoal
);
goalRouter.delete("/deleteGoal/:goal_id", authMiddleware, handleRemoveGoal);
goalRouter.get("/getGoalByUserId", authMiddleware, handleGetGoalsByUserId);
goalRouter.get("/getGoalById/:goal_id", authMiddleware, handleGetGoalById);
var goal_routes_default = goalRouter;

// src/routes/gpa.routes.ts
import { Router as Router5 } from "express";

// src/controllers/gpa.controller.ts
import createHttpError15 from "http-errors";
var handleGetGPABySemesterId = async (req, res, next) => {
  try {
    const { semester_id } = req.params;
    const user = req.user;
    if (!user || user.user_id === void 0) {
      throw createHttpError15.Unauthorized("Unauthorized");
    }
    if (!semester_id || Array.isArray(semester_id)) {
      throw createHttpError15.BadRequest("Invalid semester ID");
    }
    const user_id = user.user_id;
    const gpa = await getGPABySemesterId(semester_id, user_id);
    if (!gpa) {
      throw createHttpError15.NotFound(
        "GPA not found for the specified semester"
      );
    }
    res.status(200).json({
      message: "GPA retrieved successfully",
      gpa
    });
  } catch (error) {
    next(error);
  }
};
var handleGetGPAsByUserId = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.user_id === void 0) {
      throw createHttpError15.Unauthorized("Unauthorized");
    }
    const user_id = user.user_id;
    const gpas = await getGPAByUserId(user_id);
    res.status(200).json({
      message: "GPAs retrieved successfully",
      gpas
    });
  } catch (error) {
    next(error);
  }
};

// src/routes/gpa.routes.ts
var gpaRouter = Router5();
gpaRouter.get(
  "/getGPABySemester/:semester_id",
  authMiddleware,
  handleGetGPABySemesterId
);
gpaRouter.get("/getGPAsByUserId", authMiddleware, handleGetGPAsByUserId);
var gpa_routes_default = gpaRouter;

// src/routes/planner.routes.ts
import { Router as Router6 } from "express";

// src/utils/planner.validator.ts
import { z as z6 } from "zod";
var meetingSchema = z6.object({
  weekday: z6.number().int().min(1).max(7),
  start_minute: z6.number().int().min(0).max(1439),
  end_minute: z6.number().int().min(1).max(1440),
  location: z6.string().trim().max(200).nullable().optional()
}).refine((value) => value.end_minute > value.start_minute, {
  message: "End time must be after start time"
});
var taskSchema = z6.object({
  title: z6.string().trim().min(1).max(200),
  type: z6.enum(["ASSIGNMENT", "EXAM", "QUIZ", "PROJECT", "OTHER"]),
  due_at: z6.iso.datetime(),
  notes: z6.string().trim().max(2e3).nullable().optional(),
  is_complete: z6.boolean().optional(),
  reminder_offset_minutes: z6.number().int().min(0).max(43200).nullable().optional()
});
var updateTaskSchema = taskSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one task field is required"
);
var requirementSchema = z6.object({
  name: z6.string().trim().min(1).max(100),
  required_credits: z6.number().int().min(1).max(999),
  color: z6.string().regex(/^#[0-9a-f]{6}$/i).nullable().optional(),
  sort_order: z6.number().int().min(0).max(9999).optional()
});
var updateRequirementSchema = requirementSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one requirement field is required"
);
var prerequisiteSchema = z6.object({
  prerequisite_id: z6.uuid()
});
var assignRequirementSchema = z6.object({
  requirement_id: z6.uuid().nullable()
});

// src/controllers/planner.controller.ts
import createHttpError17 from "http-errors";

// src/services/planner.service.ts
import createHttpError16 from "http-errors";
var ownedCourse = (id, userId3) => prisma_default.course.findFirst({
  where: { id, semester: { user_id: userId3 } }
});
var addMeeting = async (userId3, courseId, data) => {
  if (!await ownedCourse(courseId, userId3)) {
    throw createHttpError16.NotFound("Course not found");
  }
  const conflict = await prisma_default.courseMeeting.findFirst({
    where: {
      weekday: data.weekday,
      start_minute: { lt: data.end_minute },
      end_minute: { gt: data.start_minute },
      course: { semester: { user_id: userId3 } }
    }
  });
  if (conflict) throw createHttpError16.Conflict("Meeting overlaps another course");
  return prisma_default.courseMeeting.create({ data: { ...data, course_id: courseId } });
};
var removeMeeting = async (userId3, meetingId) => {
  const meeting = await prisma_default.courseMeeting.findFirst({
    where: { id: meetingId, course: { semester: { user_id: userId3 } } }
  });
  if (!meeting) throw createHttpError16.NotFound("Meeting not found");
  return prisma_default.courseMeeting.delete({ where: { id: meetingId } });
};
var listSchedule = (userId3) => prisma_default.courseMeeting.findMany({
  where: { course: { semester: { user_id: userId3 } } },
  include: { course: { select: { id: true, name: true, course_code: true } } },
  orderBy: [{ weekday: "asc" }, { start_minute: "asc" }]
});
var createTask = async (userId3, courseId, data) => {
  if (!await ownedCourse(courseId, userId3)) {
    throw createHttpError16.NotFound("Course not found");
  }
  return prisma_default.academicTask.create({
    data: { ...data, due_at: new Date(data.due_at), course_id: courseId }
  });
};
var updateTask = async (userId3, taskId, data) => {
  const task = await prisma_default.academicTask.findFirst({
    where: { id: taskId, course: { semester: { user_id: userId3 } } }
  });
  if (!task) throw createHttpError16.NotFound("Task not found");
  const { due_at, ...rest } = data;
  return prisma_default.academicTask.update({
    where: { id: taskId },
    data: { ...rest, ...due_at ? { due_at: new Date(due_at) } : {} }
  });
};
var removeTask = async (userId3, taskId) => {
  const task = await prisma_default.academicTask.findFirst({
    where: { id: taskId, course: { semester: { user_id: userId3 } } }
  });
  if (!task) throw createHttpError16.NotFound("Task not found");
  return prisma_default.academicTask.delete({ where: { id: taskId } });
};
var listTasks = (userId3, from, to) => prisma_default.academicTask.findMany({
  where: {
    course: { semester: { user_id: userId3 } },
    ...from || to ? { due_at: { ...from ? { gte: from } : {}, ...to ? { lte: to } : {} } } : {}
  },
  include: { course: { select: { id: true, name: true, course_code: true } } },
  orderBy: { due_at: "asc" }
});
var addPrerequisite = async (userId3, courseId, prerequisiteId) => {
  if (courseId === prerequisiteId) {
    throw createHttpError16.BadRequest("A course cannot require itself");
  }
  const owned = await prisma_default.course.count({
    where: { id: { in: [courseId, prerequisiteId] }, semester: { user_id: userId3 } }
  });
  if (owned !== 2) throw createHttpError16.NotFound("Course not found");
  const edges = await prisma_default.coursePrerequisite.findMany({
    where: { course: { semester: { user_id: userId3 } } }
  });
  const queue = [prerequisiteId];
  const visited = /* @__PURE__ */ new Set();
  while (queue.length) {
    const current = queue.shift();
    if (current === courseId) {
      throw createHttpError16.Conflict("Prerequisite cycle detected");
    }
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(
      ...edges.filter((edge) => edge.course_id === current).map((edge) => edge.prerequisite_id)
    );
  }
  return prisma_default.coursePrerequisite.create({
    data: { course_id: courseId, prerequisite_id: prerequisiteId }
  });
};
var removePrerequisite = (userId3, courseId, prerequisiteId) => prisma_default.coursePrerequisite.deleteMany({
  where: {
    course_id: courseId,
    prerequisite_id: prerequisiteId,
    course: { semester: { user_id: userId3 } }
  }
});
var createRequirement = (userId3, data) => prisma_default.degreeRequirement.create({ data: { ...data, user_id: userId3 } });
var updateRequirement = async (userId3, requirementId, data) => {
  const requirement = await prisma_default.degreeRequirement.findFirst({
    where: { id: requirementId, user_id: userId3 }
  });
  if (!requirement) throw createHttpError16.NotFound("Requirement not found");
  return prisma_default.degreeRequirement.update({ where: { id: requirementId }, data });
};
var removeRequirement = (userId3, requirementId) => prisma_default.degreeRequirement.deleteMany({ where: { id: requirementId, user_id: userId3 } });
var assignRequirement = async (userId3, courseId, requirementId) => {
  if (!await ownedCourse(courseId, userId3)) throw createHttpError16.NotFound("Course not found");
  if (requirementId) {
    const requirement = await prisma_default.degreeRequirement.findFirst({
      where: { id: requirementId, user_id: userId3 }
    });
    if (!requirement) throw createHttpError16.NotFound("Requirement not found");
  }
  return prisma_default.course.update({
    where: { id: courseId },
    data: { requirement_id: requirementId }
  });
};
var listRequirements = async (userId3) => {
  const requirements = await prisma_default.degreeRequirement.findMany({
    where: { user_id: userId3 },
    include: { courses: { select: { credit: true, type: true } } },
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }]
  });
  return requirements.map(({ courses, ...requirement }) => ({
    ...requirement,
    actual_credits: courses.filter((course) => course.type === "ACTUAL").reduce((sum, course) => sum + course.credit, 0),
    projected_credits: courses.reduce((sum, course) => sum + course.credit, 0)
  }));
};

// src/controllers/planner.controller.ts
var userId = (req) => {
  if (!req.user) throw createHttpError17.Unauthorized();
  return req.user.user_id;
};
var param = (req, name) => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw createHttpError17.BadRequest(`Invalid ${name}`);
  return value;
};
var action = (handler, status = 200) => async (req, res, next) => {
  try {
    const data = await handler(req);
    res.status(status).json({ data });
  } catch (error) {
    next(error);
  }
};
var handleAddMeeting = action(
  (req) => addMeeting(userId(req), param(req, "course_id"), req.body),
  201
);
var handleDeleteMeeting = action(
  (req) => removeMeeting(userId(req), param(req, "meeting_id"))
);
var handleSchedule = action((req) => listSchedule(userId(req)));
var handleCreateTask = action(
  (req) => createTask(userId(req), param(req, "course_id"), req.body),
  201
);
var handleUpdateTask = action(
  (req) => updateTask(userId(req), param(req, "task_id"), req.body)
);
var handleDeleteTask = action(
  (req) => removeTask(userId(req), param(req, "task_id"))
);
var handleTasks = action((req) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : void 0;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : void 0;
  if (from && Number.isNaN(from.getTime()) || to && Number.isNaN(to.getTime())) {
    throw createHttpError17.BadRequest("Invalid date range");
  }
  return listTasks(userId(req), from, to);
});
var handleAddPrerequisite = action(
  (req) => addPrerequisite(
    userId(req),
    param(req, "course_id"),
    req.body.prerequisite_id
  ),
  201
);
var handleDeletePrerequisite = action(
  (req) => removePrerequisite(
    userId(req),
    param(req, "course_id"),
    param(req, "prerequisite_id")
  )
);
var handleCreateRequirement = action(
  (req) => createRequirement(userId(req), req.body),
  201
);
var handleUpdateRequirement = action(
  (req) => updateRequirement(userId(req), param(req, "requirement_id"), req.body)
);
var handleDeleteRequirement = action(
  (req) => removeRequirement(userId(req), param(req, "requirement_id"))
);
var handleRequirements = action((req) => listRequirements(userId(req)));
var handleAssignRequirement = action(
  (req) => assignRequirement(
    userId(req),
    param(req, "course_id"),
    req.body.requirement_id
  )
);

// src/routes/planner.routes.ts
var router = Router6();
router.use(authMiddleware);
router.get("/schedule", handleSchedule);
router.post("/courses/:course_id/meetings", validate(meetingSchema), handleAddMeeting);
router.delete("/meetings/:meeting_id", handleDeleteMeeting);
router.get("/tasks", handleTasks);
router.post("/courses/:course_id/tasks", validate(taskSchema), handleCreateTask);
router.patch("/tasks/:task_id", validate(updateTaskSchema), handleUpdateTask);
router.delete("/tasks/:task_id", handleDeleteTask);
router.post(
  "/courses/:course_id/prerequisites",
  validate(prerequisiteSchema),
  handleAddPrerequisite
);
router.delete(
  "/courses/:course_id/prerequisites/:prerequisite_id",
  handleDeletePrerequisite
);
router.get("/requirements", handleRequirements);
router.post("/requirements", validate(requirementSchema), handleCreateRequirement);
router.patch(
  "/requirements/:requirement_id",
  validate(updateRequirementSchema),
  handleUpdateRequirement
);
router.delete("/requirements/:requirement_id", handleDeleteRequirement);
router.patch(
  "/courses/:course_id/requirement",
  validate(assignRequirementSchema),
  handleAssignRequirement
);
var planner_routes_default = router;

// src/routes/data-transfer.routes.ts
import { Router as Router7 } from "express";

// src/utils/data-transfer.validator.ts
import { z as z7 } from "zod";
var guestCourse = createCourseSchema.omit({ semester_id: true }).extend({
  id: z7.string().min(1).max(100)
});
var guestSemester = z7.object({
  id: z7.string().min(1).max(100),
  year: z7.number().int().min(1900).max(2200),
  term: z7.string().trim().min(1).max(100),
  term_no: z7.number().int().min(1).max(10),
  is_complete: z7.boolean(),
  courses: z7.array(guestCourse).max(100)
});
var guestGoal = z7.object({
  name: z7.string().trim().min(1).max(200),
  target_gpa: z7.number().min(0).max(4),
  is_achieved: z7.boolean(),
  target_semester_id: z7.string().min(1).max(100)
});
var guestSnapshotSchema = z7.object({
  schema_version: z7.literal(1),
  semesters: z7.array(guestSemester).max(50),
  goals: z7.array(guestGoal).max(100).default([])
});
var guestCommitSchema = z7.object({
  snapshot: guestSnapshotSchema,
  merge_token: z7.string().min(20).max(300),
  decisions: z7.array(z7.object({
    semester_id: z7.string().min(1).max(100),
    action: z7.enum(["KEEP_CLOUD", "REPLACE_CLOUD", "MERGE_COURSES"])
  })).max(50)
});

// src/controllers/data-transfer.controller.ts
import createHttpError19 from "http-errors";

// src/services/data-transfer.service.ts
import createHttpError18 from "http-errors";
import { createHash as createHash4, createHmac, timingSafeEqual } from "crypto";
var snapshotHash = (snapshot) => createHash4("sha256").update(JSON.stringify(snapshot)).digest("hex");
var signature = (value) => createHmac("sha256", process.env.REFRESH_SECRET_KEY).update(value).digest("hex");
var createMergeToken = (userId3, snapshot) => {
  const expires = Date.now() + 10 * 60 * 1e3;
  const payload = `${userId3}.${snapshotHash(snapshot)}.${expires}`;
  return `${expires}.${signature(payload)}`;
};
var verifyMergeToken = (userId3, snapshot, token) => {
  const [rawExpires, provided] = token.split(".");
  const expires = Number(rawExpires);
  if (!provided || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = signature(`${userId3}.${snapshotHash(snapshot)}.${expires}`);
  const actualBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};
var exportUserData = async (userId3) => {
  const [semesters, goals, requirements] = await Promise.all([
    prisma_default.semester.findMany({
      where: { user_id: userId3 },
      orderBy: [{ year: "asc" }, { term_no: "asc" }],
      include: { courses: { include: { meetings: true, tasks: true } }, gpas: true }
    }),
    prisma_default.goal.findMany({ where: { user_id: userId3 } }),
    prisma_default.degreeRequirement.findMany({ where: { user_id: userId3 } })
  ]);
  return {
    schema_version: 1,
    exported_at: (/* @__PURE__ */ new Date()).toISOString(),
    semesters,
    goals,
    degree_requirements: requirements
  };
};
var previewGuestImport = async (userId3, snapshot) => {
  const keys = snapshot.semesters.map((semester) => ({
    year: semester.year,
    term_no: semester.term_no
  }));
  const existing = keys.length ? await prisma_default.semester.findMany({
    where: { user_id: userId3, OR: keys },
    select: { id: true, year: true, term_no: true, term: true }
  }) : [];
  return {
    merge_token: createMergeToken(userId3, snapshot),
    conflicts: snapshot.semesters.flatMap((guest) => {
      const cloud = existing.find(
        (item) => item.year === guest.year && item.term_no === guest.term_no
      );
      return cloud ? [{ guest_semester_id: guest.id, guest, cloud }] : [];
    }),
    counts: {
      semesters: snapshot.semesters.length,
      courses: snapshot.semesters.reduce((sum, item) => sum + item.courses.length, 0),
      goals: snapshot.goals.length
    }
  };
};
var commitGuestImport = async (userId3, idempotencyKey, snapshot, mergeToken, decisions) => {
  if (!verifyMergeToken(userId3, snapshot, mergeToken)) {
    throw createHttpError18.Unauthorized("Invalid or expired merge token");
  }
  return prisma_default.$transaction(async (tx) => {
    const previous = await tx.importOperation.findUnique({
      where: { user_id_key: { user_id: userId3, key: idempotencyKey } }
    });
    if (previous) return previous.response;
    const decisionMap = new Map(
      decisions.map((decision) => [decision.semester_id, decision.action])
    );
    const semesterMap = /* @__PURE__ */ new Map();
    let importedSemesters = 0;
    let importedCourses = 0;
    for (const guest of snapshot.semesters) {
      let cloud = await tx.semester.findFirst({
        where: { user_id: userId3, year: guest.year, term_no: guest.term_no },
        include: { courses: true }
      });
      const action2 = decisionMap.get(guest.id) ?? "KEEP_CLOUD";
      if (cloud && action2 === "REPLACE_CLOUD") {
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
            user_id: userId3
          },
          include: { courses: true }
        });
        importedSemesters += 1;
      }
      semesterMap.set(guest.id, cloud.id);
      if (action2 === "KEEP_CLOUD" && cloud.courses.length > 0) continue;
      const existingKeys = new Set(
        cloud.courses.map(
          (course) => `${course.name.trim().toLowerCase()}|${course.credit}|${course.category}`
        )
      );
      const courses = guest.courses.filter((course) => {
        const key = `${course.name.trim().toLowerCase()}|${course.credit}|${course.category}`;
        return action2 !== "MERGE_COURSES" || !existingKeys.has(key);
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
            semester_id: cloud.id,
            ...course.course_code !== void 0 ? { course_code: course.course_code } : {},
            ...course.instructor !== void 0 ? { instructor: course.instructor } : {},
            ...course.notes !== void 0 ? { notes: course.notes } : {}
          }))
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
          user_id: userId3
        }
      });
      importedGoals += 1;
    }
    await recalculateUserGpas(userId3, tx);
    const result = { imported_semesters: importedSemesters, imported_courses: importedCourses, imported_goals: importedGoals };
    await tx.importOperation.create({
      data: { user_id: userId3, key: idempotencyKey, response: result }
    });
    return result;
  });
};

// src/controllers/data-transfer.controller.ts
var currentUserId = (req) => {
  if (!req.user) throw createHttpError19.Unauthorized();
  return req.user.user_id;
};
var handleExport = async (req, res, next) => {
  try {
    res.status(200).json(await exportUserData(currentUserId(req)));
  } catch (error) {
    next(error);
  }
};
var handleImportPreview = async (req, res, next) => {
  try {
    res.status(200).json(await previewGuestImport(currentUserId(req), req.body));
  } catch (error) {
    next(error);
  }
};
var handleImportCommit = async (req, res, next) => {
  try {
    const key = req.get("idempotency-key")?.trim();
    if (!key || key.length < 8 || key.length > 100) {
      throw createHttpError19.BadRequest("A valid Idempotency-Key header is required");
    }
    const result = await commitGuestImport(
      currentUserId(req),
      key,
      req.body.snapshot,
      req.body.merge_token,
      req.body.decisions
    );
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

// src/routes/data-transfer.routes.ts
var router2 = Router7();
router2.use(authMiddleware);
router2.get("/export", handleExport);
router2.post("/guest-import/preview", validate(guestSnapshotSchema), handleImportPreview);
router2.post("/guest-import/commit", validate(guestCommitSchema), handleImportCommit);
var data_transfer_routes_default = router2;

// src/routes/notification.routes.ts
import { Router as Router8 } from "express";

// src/controllers/notification.controller.ts
import createHttpError21 from "http-errors";

// src/services/notification.service.ts
import createHttpError20 from "http-errors";
var vapidPublicKey = () => {
  if (!env.WEB_PUSH_VAPID_PUBLIC_KEY) throw createHttpError20.ServiceUnavailable("Web push is not configured");
  return env.WEB_PUSH_VAPID_PUBLIC_KEY;
};
var savePushSubscription = (userId3, input, userAgent) => {
  vapidPublicKey();
  return prisma_default.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: { endpoint: input.endpoint, p256dh: input.keys.p256dh, auth: input.keys.auth, user_agent: userAgent, user_id: userId3 },
    update: { p256dh: input.keys.p256dh, auth: input.keys.auth, user_agent: userAgent, user_id: userId3 },
    select: { id: true, created_at: true, updated_at: true }
  });
};
var removePushSubscription = async (userId3, id) => {
  const subscription = await prisma_default.pushSubscription.findFirst({ where: { id, user_id: userId3 }, select: { id: true } });
  if (!subscription) throw createHttpError20.NotFound("Push subscription not found");
  await prisma_default.pushSubscription.delete({ where: { id } });
};

// src/controllers/notification.controller.ts
var userId2 = (req) => {
  if (!req.user) throw createHttpError21.Unauthorized();
  return req.user.user_id;
};
var handleVapidPublicKey = (req, res, next) => {
  try {
    userId2(req);
    res.status(200).json({ public_key: vapidPublicKey() });
  } catch (error) {
    next(error);
  }
};
var handleSaveSubscription = async (req, res, next) => {
  try {
    const subscription = await savePushSubscription(userId2(req), req.body, req.get("user-agent"));
    res.status(201).json({ data: subscription });
  } catch (error) {
    next(error);
  }
};
var handleRemoveSubscription = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) throw createHttpError21.BadRequest("Invalid subscription id");
    await removePushSubscription(userId2(req), id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// src/utils/notification.validator.ts
import { z as z8 } from "zod";
var pushSubscriptionSchema = z8.object({
  endpoint: z8.url().max(2048),
  expirationTime: z8.number().nullable().optional(),
  keys: z8.object({ p256dh: z8.string().min(20).max(512), auth: z8.string().min(8).max(256) })
});

// src/routes/notification.routes.ts
var router3 = Router8();
router3.use(authMiddleware);
router3.get("/vapid-public-key", handleVapidPublicKey);
router3.post("/subscriptions", validate(pushSubscriptionSchema), handleSaveSubscription);
router3.delete("/subscriptions/:id", handleRemoveSubscription);
var notification_routes_default = router3;

// src/routes/routes.ts
var router4 = Router9();
router4.use("/auth", auth_routes_default);
router4.use("/semesters", semester_routes_default);
router4.use("/courses", course_routes_default);
router4.use("/goals", goal_routes_default);
router4.use("/gpa", gpa_routes_default);
router4.use("/planner", planner_routes_default);
router4.use("/data", data_transfer_routes_default);
router4.use("/notifications", notification_routes_default);
var routes_default = router4;

// src/app.ts
import createHttpError22, { isHttpError } from "http-errors";
import morgan from "morgan";

// src/config/http.ts
var getAllowedOrigins = (raw2 = process.env.CORS_ALLOWED_ORIGINS ?? "") => new Set(
  raw2.split(",").map((origin) => origin.trim()).filter(Boolean)
);
var isOriginAllowed = (origin, allowedOrigins2 = getAllowedOrigins(), nodeEnv = process.env.NODE_ENV) => {
  if (!origin) return true;
  if (allowedOrigins2.has(origin)) return true;
  return nodeEnv !== "production" && allowedOrigins2.size === 0;
};
var getTrustProxy = (raw2 = process.env.TRUST_PROXY) => {
  const value = raw2?.trim();
  if (!value || value.toLowerCase() === "false") return false;
  if (value.toLowerCase() === "true") {
    throw new Error(
      "TRUST_PROXY=true trusts arbitrary clients. Use a hop count or explicit proxy CIDRs."
    );
  }
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
};

// src/app.ts
var app = express();
var allowedOrigins = getAllowedOrigins();
app.disable("x-powered-by");
app.set("trust proxy", getTrustProxy());
app.use(requestIdMiddleware);
morgan.token("client-ip", (req) => {
  return req.ip || req.socket.remoteAddress || "unknown";
});
app.use(
  morgan(":client-ip :method :url :status :response-time ms", {
    stream: {
      write: (message) => logger_default.http(message.trim())
    }
  })
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 }));
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      return callback(createHttpError22.Forbidden("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key", "X-Request-ID"],
    maxAge: 600
  })
);
app.get("/health/live", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  try {
    await prisma_default.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
app.use("/api/v1", routes_default);
app.use((req, res, next) => {
  next(createHttpError22(404, "Route not found"));
});
app.use((err, req, res, next) => {
  const prismaCode = typeof err === "object" && err !== null && "code" in err ? String(err.code) : void 0;
  if (prismaCode === "P2002") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }
  if (prismaCode === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }
  if (prismaCode === "P1000" || prismaCode === "P1010") {
    logger_default.error(`[${req.requestId}] Database authentication or authorization failed`);
    return res.status(503).json({ message: "Database temporarily unavailable" });
  }
  if (isHttpError(err)) {
    if (err.status >= 500) {
      logger_default.error(`[${req.requestId}] ${err.status} ${err.message}`);
    }
    res.status(err.status).json({ message: err.message });
  } else {
    logger_default.error(`[${req.requestId}] Unexpected Error: ${err}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
var app_default = app;

// src/index.ts
var PORT = env.PORT;
app_default.listen(PORT, () => {
  logger_default.info(`Listening on port ${PORT}`);
});
