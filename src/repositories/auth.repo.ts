import createHttpError from "http-errors";
import prisma from "../config/prisma.js";
import { compare, hash } from "bcrypt";
import { randomBytes, createHash } from "crypto";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);

// Valid OTP purposes — must match the OtpPurpose enum in schema.prisma
const VALID_OTP_PURPOSES = ["reset_password"] as const;
export type OtpPurpose = (typeof VALID_OTP_PURPOSES)[number];

export const isValidOtpPurpose = (value: string): value is OtpPurpose =>
  VALID_OTP_PURPOSES.includes(value as OtpPurpose);

export const createUser = async (data: {
  name: string;
  password: string;
  email: string;
}) => {
  const isExisted = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (isExisted) {
    throw createHttpError.Conflict("This email has been used");
  }

  const hashedPassword = await hash(data.password, BCRYPT_ROUNDS);

  return await prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });
};

export const findUserByEmailAndPassword = async (data: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw createHttpError.Unauthorized("Invalid User or Password");

  const isMatched = await compare(data.password, user.password);
  if (!isMatched)
    throw createHttpError.Unauthorized("Invalid User or Password");

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const findUsers = async (
  data: Partial<{
    id?: string;
    name?: string;
    email?: string;
  }>,
) => {
  return await prisma.user.findMany({
    where: {
      ...data,
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });
};

export const findUserById = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, created_at: true },
  });

export const updateUserProfile = async (
  id: string,
  data: { name?: string; email?: string },
) => prisma.user.update({
  where: { id },
  data,
  select: { id: true, name: true, email: true, created_at: true },
});

export const changeUserPassword = async (
  id: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !(await compare(currentPassword, user.password))) {
    throw createHttpError.Unauthorized("Current password is incorrect");
  }
  const password = await hash(newPassword, BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { password } }),
    prisma.refreshSession.updateMany({
      where: { user_id: id, revoked_at: null },
      data: { revoked_at: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({ where: { user_id: id } }),
  ]);
};

export const deleteUserAccount = async (id: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !(await compare(password, user.password))) {
    throw createHttpError.Unauthorized("Password is incorrect");
  }
  await prisma.user.delete({ where: { id } });
};

export const createOTP = async (email: string, otp: string) => {
  // Fix #8: purpose is now a typed enum value, not a free-form string
  await prisma.otp.deleteMany({
    where: {
      email,
      purpose: "reset_password",
    },
  });

  const hashedOtp = await hash(otp, BCRYPT_ROUNDS);

  await prisma.otp.create({
    data: {
      email,
      otp: hashedOtp,
      purpose: "reset_password",
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
};

export const verifyOTP = async (
  email: string,
  otp: string,
  purpose: OtpPurpose,
) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createHttpError.NotFound("User not found");
  }

  const otpRecord = await prisma.otp.findUnique({
    where: {
      email_purpose: { email, purpose },
    },
  });

  if (!otpRecord) {
    throw createHttpError.NotFound("Invalid or expired OTP");
  }

  // Fix #1: check attempts BEFORE verifying so the gate is accurate
  if (otpRecord.attempts >= 5) {
    throw createHttpError.TooManyRequests("Too many failed attempts");
  }

  // Fix #1: check expiry before doing bcrypt work
  if (otpRecord.expires_at < new Date()) {
    await prisma.otp.delete({ where: { id: otpRecord.id } });
    throw createHttpError.BadRequest("OTP has expired");
  }

  const isMatched = await compare(otp, otpRecord.otp);

  if (!isMatched) {
    // Fix #1: only increment on failure
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw createHttpError.BadRequest("Invalid OTP");
  }

  // Fix #2: delete the OTP record immediately on success so it can't be reused
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  await prisma.passwordResetToken.deleteMany({
    where: { user_id: user.id },
  });

  // Fix #6: store a SHA-256 hash of the reset token, not the raw value
  const resetToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(resetToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      user_id: user.id,
    },
  });

  // Return the raw token to the caller (sent to the user); only the hash is stored
  return resetToken;
};

export const updatePassword = async (token: string, newPassword: string) => {
  // Fix #6: hash the incoming token before looking it up
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const resetTokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetTokenRecord) {
    throw createHttpError.NotFound("Invalid or expired reset token");
  }

  if (resetTokenRecord.expires_at < new Date()) {
    // Fix #10: clean up stale tokens instead of leaving them in the DB
    await prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id },
    });
    throw createHttpError.BadRequest("Reset token has expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: resetTokenRecord.user_id },
  });

  if (!user) {
    throw createHttpError.NotFound("User not found");
  }

  // Fix #9: use the shared BCRYPT_ROUNDS constant
  const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id },
    }),
    prisma.refreshSession.updateMany({
      where: { user_id: user.id, revoked_at: null },
      data: { revoked_at: new Date() },
    }),
  ]);

  return { message: "Password reset successful" };
};
