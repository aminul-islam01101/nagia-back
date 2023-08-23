import type { AuthRequest } from "@interfaces/basic.types";
import { User } from "@modules/user/user.schema";
import handleResponse from "@utils/appResponse";
import { checkPassword, hashPassword } from "@utils/hash.helper";
import { createToken, verifyToken } from "@utils/jwt.helper";
import { createSession, invalidateSession } from "@utils/sessions";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import validator from "validator";
import type { AdminService } from "./admin.service";

export class AdminController {
  constructor(readonly adminService: AdminService) {}

  async signup(req: Request, res: Response): Promise<void> {
    const passed = await User.safeParseAsync(req.body);
    if (passed.success) {
      const { email, password, username } = passed.data;
      const foundUsername = await this.adminService.findByUsernameService(username);
      if (foundUsername !== null) {
        handleResponse(res, 400, "Username already exists", false, {
          error: "sign up error",
        });
        return;
      }
      const foundEmail = await this.adminService.findByEmailService(email);
      if (foundEmail !== null) {
        handleResponse(res, 400, "Email already exists", false, {
          error: "sign up error",
        });
        return;
      }
      const hashedPassword = await hashPassword(password);
      // create account;
      const created = await this.adminService.createAdminAccount({
        password: hashedPassword,
        email,
        username,
      });

      handleResponse(res, httpStatus.CREATED, "account created", true, created);
      return;
    }
    handleResponse(res, httpStatus.BAD_REQUEST, "validation error", false, {
      error: passed.error,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    // validate
    const isValidEmail = validator.isEmail(email);
    const isValidPassword = typeof password === "string";
    if (!isValidPassword) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Invalid password", false, {
        error: "Password must is invalid and not in the right form",
      });
    }
    if (!isValidEmail) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Email is invalid", false, {
        error: "Enter a proper email",
      });
      return;
    }
    // find if the email exists
    const accountExists = await this.adminService.findByEmailService(email);
    if (accountExists === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "login error", false, {
        error: "User not found",
      });
      return;
    }
    // compare password
    const passwordMatch = await checkPassword(password, accountExists.password);
    if (!passwordMatch) {
      handleResponse(res, httpStatus.UNAUTHORIZED, "login error", false, {
        error: "Invalid email or password",
      });
    }
    // check if account is verified
    if (!accountExists.isVerified) {
      handleResponse(res, httpStatus.UNAUTHORIZED, "login error", false, {
        error: "Your account has not been verified, you're not an admin.",
      });
      return;
    }
    // create sessions
    const session = createSession(accountExists.username);
    // do jwt
    const accessToken = createToken(
      {
        id: accountExists.id,
        username: accountExists.username,
        role: accountExists.role,
        sessionId: session.sessionId,
      },
      "3d"
    );
    const refreshToken = createToken(
      {
        sessionId: session.username,
      },
      "1y"
    );
    const { password: pswd, ...rest } = accountExists;
    const data = { ...rest, accessToken, refreshToken };
    handleResponse(res, httpStatus.OK, "Authenticated, user found", true, data);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.body.token;
    if (refreshToken === null || refreshToken === undefined) {
      handleResponse(res, httpStatus.UNAUTHORIZED, "Unauthorized", false, {
        error: "Unauthorized user, no tokens in request",
      });
      return;
    }
    try {
      const decoded = verifyToken(refreshToken);
      if (decoded === null) {
        handleResponse(res, 401, "Token is null", false, {
          error: "Couldn't get user from token sent",
        });
        return;
      }
      const accountExists = await this.adminService.findByUsernameService(decoded.sessionId);

      if (accountExists === null || accountExists === undefined) {
        handleResponse(res, 404, "Not Found", false, {
          error: "User not found",
        });
        return;
      }

      // create sessions
      const session = createSession(accountExists.username);
      // do jwt
      const accessToken = createToken(
        {
          id: accountExists.id,
          username: accountExists.username,
          role: accountExists.role,
          sessionId: session.sessionId,
        },
        "3d"
      );
      const refreshToken_ = createToken(
        {
          sessionId: session.username,
        },
        "1y"
      );

      const data = {
        accessToken,
        refreshToken: refreshToken_,
      };
      handleResponse(res, httpStatus.OK, "Authenticated, user found", true, data);
    } catch (err) {
      handleResponse(res, 403, "Bad request", false, {
        error: err,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    if ((req as AuthRequest).user !== undefined) {
      invalidateSession((req as AuthRequest).user.sessionId);
      handleResponse(res, httpStatus.OK, "user logged out", true, {});
    } else {
      handleResponse(res, httpStatus.UNAUTHORIZED, "You're not logged in", false, {});
    }
  }
}
