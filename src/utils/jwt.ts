import jwt from "jsonwebtoken";
import ms from "ms";

const SECRET = {
  access: process.env.ACCESS_SECRET_KEY,
};

const EXPIRES_IN = {
  access: Math.floor(ms("1h") / 1000),
};

export const signToken = (
  payload: { user_id: string; email: string },
) => {
  return jwt.sign(payload, SECRET.access as string, {
    expiresIn: EXPIRES_IN.access,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET.access as string);
};
