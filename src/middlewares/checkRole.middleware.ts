import handleResponse from "@utils/appResponse";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { AuthRequest } from "@interfaces/basic.types";

// higher order function to compare roles
export function checkRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (user === null || user === undefined) {
      handleResponse(res, httpStatus.UNAUTHORIZED, "Access Forbidden", false, {
        error: `Only ${allowedRoles.map((role) => role).join(", ")} allowed to access this route`,
      });
      return;
    }
    // no role in user
    if (user.role === undefined) {
      handleResponse(res, 403, "No roles passed", false, {
        error: "No roles found for the user, access forbidden",
      });
      return;
    }
    if (allowedRoles.map(roles => roles.toUpperCase()).includes(user.role.toUpperCase())) {
      next();
      return;
    }
    handleResponse(res, httpStatus.UNAUTHORIZED, "You're not authorized to access this route", false, {
      error: "You do not have the role required to access this protected resource, unauthorized",
    });
  };
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;

  if (user === null || user === undefined) {
    handleResponse(res, httpStatus.UNAUTHORIZED, "Access Forbidden", false, {
      error: "Only admins allowed to access this route",
    });
    return;
  }
  // no role in user
  if (user.role === undefined) {
    handleResponse(res, 403, "No roles passed", false, {
      error: "No roles found for the user, access forbidden",
    });
    return;
  }
  if (user.role.toLowerCase() === "admin") {
    // If the user is an admin, grant access to the protected route.
    next();
  } else {
    // If the user is not an admin, return a 403 Forbidden error.
    handleResponse(res, 403, "Access Forbidden", false, { error: "Access forbidden. Admin access required." });
  }
}
