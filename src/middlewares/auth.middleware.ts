import { type JWT, type AuthRequest } from "@interfaces/basic.types";
import handleResponse from "@utils/appResponse";
import { verifyToken } from "@utils/jwt.helper";
import type { Response, NextFunction, Request } from "express";
import httpStatus from "http-status";

export default function auth(req: Request, res: Response, next: NextFunction): void {
  const accessToken = req.headers.authorization;

  if (accessToken === null || accessToken === undefined) {
    handleResponse(res, httpStatus.UNAUTHORIZED, "No access token found", false, {
      error: "No access token provided for authentication",
    });
    return;
  }
  if (!accessToken.includes("Bearer")) {
    handleResponse(res, httpStatus.BAD_REQUEST, "Token is in bad format, must begin with Bearer", false, {
      error: "Invalid token format"
    })
    return
  }
  const now = Math.floor(Date.now() / 1000); // Get current time in seconds
  // verify token, valid access token and not expired
  const verified = verifyToken(accessToken.split('Bearer ')[1]) as JWT;
  if (verified !== null && verified !== undefined && verified.exp > now) {
    (req as AuthRequest).user = verified;
    next();
    return;
  }
  handleResponse(res, httpStatus.UNAUTHORIZED, "UNAUTHORIZED", false, {
    error: "Expired token or user isn't logged in"
  })
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if ((req as AuthRequest).user === null || (req as AuthRequest).user === undefined) {
    handleResponse(res, httpStatus.FORBIDDEN, "Invalid session", false, {
      error: "Invalid user session",
    });
    return;
  }
  next();
}
