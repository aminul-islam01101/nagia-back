import { type JwtPayloadType } from "@utils/jwt.helper";
import { type Request } from "express";

export type ObjectOrMessage =
  | string
  | {
      message: string;
    };

export type ErrorObject = { statusCode: number; status?: string } & Error;

export interface ResponseType<T> {
  status: string;
  message: string;
  data: Record<string, T>;
}

export interface JWT extends JwtPayloadType {
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user: JWT;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export type Stat = Record<string, number>;

export interface TransactionStat {
  daily: Stat;
  weekly: Stat;
  monthly: Stat;
}
