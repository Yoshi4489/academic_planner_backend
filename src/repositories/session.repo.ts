import createHttpError from "http-errors";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import prisma from "../config/prisma.js";

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

type SessionMetadata = {
  deviceInfo?: string | undefined;
  ipAddress?: string | undefined;
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const newToken = () => {
  const id = randomUUID();
  const raw = `${id}.${randomBytes(32).toString("hex")}`;
  return { id, raw, hash: hashToken(raw) };
};

export const createRefreshSession = async (
  userId: string,
  metadata: SessionMetadata,
) => {
  const token = newToken();
  await prisma.refreshSession.create({
    data: {
      id: token.id,
      token_hash: token.hash,
      family_id: randomUUID(),
      expires_at: new Date(Date.now() + SESSION_LIFETIME_MS),
      ...(metadata.deviceInfo ? { device_info: metadata.deviceInfo } : {}),
      ...(metadata.ipAddress ? { ip_address: metadata.ipAddress } : {}),
      user_id: userId,
    },
  });
  return token.raw;
};

export const rotateRefreshSession = async (
  rawToken: string,
  metadata: SessionMetadata,
) => {
  const session = await prisma.refreshSession.findUnique({
    where: { token_hash: hashToken(rawToken) },
    include: {
      user: {
        select: { id: true, name: true, email: true, created_at: true },
      },
    },
  });

  if (!session) throw createHttpError.Unauthorized("Invalid refresh token");

  if (session.revoked_at) {
    await prisma.refreshSession.updateMany({
      where: { family_id: session.family_id, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    throw createHttpError.Unauthorized("Refresh token reuse detected");
  }

  const now = new Date();
  const idleDeadline = new Date(session.last_used_at.getTime() + SESSION_IDLE_MS);
  if (session.expires_at <= now || idleDeadline <= now) {
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revoked_at: now },
    });
    throw createHttpError.Unauthorized("Refresh session expired");
  }

  const next = newToken();
  await prisma.$transaction([
    prisma.refreshSession.update({
      where: { id: session.id },
      data: { revoked_at: now, last_used_at: now },
    }),
    prisma.refreshSession.create({
      data: {
        id: next.id,
        token_hash: next.hash,
        family_id: session.family_id,
        expires_at: session.expires_at,
        ...(metadata.deviceInfo ? { device_info: metadata.deviceInfo } : {}),
        ...(metadata.ipAddress ? { ip_address: metadata.ipAddress } : {}),
        user_id: session.user_id,
      },
    }),
  ]);

  return { refreshToken: next.raw, user: session.user };
};

export const revokeRefreshSession = async (userId: string, rawToken: string) => {
  const session = await prisma.refreshSession.findUnique({
    where: { token_hash: hashToken(rawToken) },
    select: { user_id: true, family_id: true },
  });
  if (!session || session.user_id !== userId) return;
  await prisma.refreshSession.updateMany({
    where: { user_id: userId, family_id: session.family_id, revoked_at: null },
    data: { revoked_at: new Date() },
  });
};

export const revokeAllRefreshSessions = async (userId: string) => {
  await prisma.refreshSession.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
};
