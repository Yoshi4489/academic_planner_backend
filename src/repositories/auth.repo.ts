import createHttpError from "http-errors";
import prisma from "../config/prisma.js";
import { compare, genSalt, hash } from "bcrypt";

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

  const salt = await genSalt(10);
  const hashedPassword = await hash(data.password, salt);

  return await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
};

export const findUserByEmailAndPassword = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw createHttpError.Unauthorized("User not found");

  const isMatched = await compare(data.password, user.password);
  if (!isMatched)
    throw createHttpError.Unauthorized("Invalid User or Password");

  return user;
};

export const findUsers = async (data: Partial<{
  id?: string;
  name?: string;
  email?: string;
}>) => {
  return await prisma.user.findMany({
    where: {
      ...data,
    },
  });
};
