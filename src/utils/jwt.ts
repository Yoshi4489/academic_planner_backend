import jwt from "jsonwebtoken";

const SECRET = process.env.ACCESS_SECRET_KEY;

export const signToken = (payload: { user_id: string, email: string }) => {
  return jwt.sign(payload, SECRET as string, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET as string);
};
