import jwt from "jsonwebtoken";
import ms from "ms";

const SECRET = {
  access: process.env.ACCESS_SECRET_KEY,
  refresh: process.env.REFRESH_SECRET_KEY,
};

const EXPIRES_IN = {
  access: Math.floor(ms("1h") / 1000),
  refresh: Math.floor(ms("30d") / 1000),
};

type TokenType = "access" | "refresh";

export const signToken = (
  payload: { user_id: string; email?: string },
  type: TokenType,
) => {
  return jwt.sign(payload, SECRET[type] as string, {
    expiresIn: EXPIRES_IN[type],
  });
};

export const verifyToken = (token: string, type: TokenType) => {
  return jwt.verify(token, SECRET[type] as string);
};
