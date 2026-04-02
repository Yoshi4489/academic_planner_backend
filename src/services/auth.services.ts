import prisma from "../config/prisma.js";
import {
  createUser,
  findUserByEmailAndPassword,
  findUsers,
} from "../repositories/auth.repo.js";

export const registerUser = async (
  name: string,
  password: string,
  email: string,
) => {
  const user = await createUser({ name, password, email });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmailAndPassword({ email, password });
  return user;
};

export const getUsers = async (id?: string, name?: string, email?: string) => {
  const filters: { id?: string; name?: string; email?: string } = {};

  if (id !== undefined) filters.id = id;
  if (name !== undefined) filters.name = name;
  if (email !== undefined) filters.email = email;

  const users = await findUsers(filters);
  return users;
};
