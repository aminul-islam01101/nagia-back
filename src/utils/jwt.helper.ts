import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv"
config()

const secret = process.env.JWT_SECRET_KEY as string;

export interface JwtPayloadType {
  id?: string;
  username?: string;
  role?: string;
  sessionId: string;
}

export const createToken = (userData: JwtPayloadType, expiresIn: string): string => {
  return jwt.sign(userData, secret, { expiresIn });
};

export const decodeToken = (details: string): jwt.JwtPayload | string | null  => {
  return jwt.decode(details);
};

export const verifyToken = (token: string): null | JwtPayload  => {
  return jwt.verify(token, secret) as jwt.JwtPayload | null;
};
