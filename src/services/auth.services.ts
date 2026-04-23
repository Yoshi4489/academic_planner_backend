import createHttpError from "http-errors";
import {
  createUser,
  findUserByEmailAndPassword,
  findUsers,
} from "../repositories/auth.repo.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import logger from "../config/logger.js";

export const registerUser = async (
  name: string,
  password: string,
  email: string,
) => {
  const user = await createUser({ name, password, email });
  const access_token = await signToken(
    { user_id: user.id, email: user.email },
    "access",
  );
  const refresh_token = await signToken({ user_id: user.id }, "refresh");
  logger.info(`New user registered: ${email}`);
  return { user, access_token, refresh_token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmailAndPassword({ email, password });
  const access_token = await signToken(
    { user_id: user.id, email: user.email },
    "access",
  );
  const refresh_token = await signToken({ user_id: user.id }, "refresh");
  logger.info(`User logged in: ${email}`);
  return { user, access_token, refresh_token };
};

export const getUsers = async (id?: string, name?: string, email?: string) => {
  const filters: { id?: string; name?: string; email?: string } = {};

  if (id !== undefined) filters.id = id;
  if (name !== undefined) filters.name = name;
  if (email !== undefined) filters.email = email;

  const users = await findUsers(filters);
  logger.info(`Retrieved users: ${users.length}`);
  return users;
};

export const getUserById = async (id: string) => {
  const users = await findUsers({ id });
  logger.info(`Retrieved user: ${id}`);
  return users.length > 0 ? users[0] : null;
};

export const refreshToken = async (refreshToken: string) => {
  const decoded = verifyToken(refreshToken, "refresh");

  if (!decoded) {
    throw createHttpError.Unauthorized("Invalid token");
  }

  const { user_id } = decoded as { user_id: string };

  const user = await getUserById(user_id);

  if (!user) {
    throw createHttpError.NotFound("User not found");
  }

  const access_token = signToken({ user_id, email: user.email }, "access");
  logger.info(`Token refreshed for user: ${user.email}`);

  return { access_token, user };
};
