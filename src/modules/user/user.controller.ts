import { CheckoutForm, EmailValidation, User } from "./user.schema";
import { checkPassword, hashPassword } from "../../utils/hash.helper";
import { type UserService } from "./user.service";
import { createToken, verifyToken } from "../../utils/jwt.helper";
import handleResponse from "../../utils/appResponse";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import sendVerificationEmail, { emailVerificationSetup, resetPasswordMail } from "../../utils/sendgrid";
import validator from "validator";
import redisClient from "../../utils/redis.helper";
import { createSession, invalidateSession } from "@utils/sessions";
import { type AuthRequest } from "@interfaces/basic.types";

export class UserController {
  constructor(readonly userService: UserService) {}

  async signup(req: Request, res: Response): Promise<void> {
    // empty db
    // await this.userService.deleteAllAccountsService();
    const passed = await User.safeParseAsync(req.body);
    if (passed.success) {
      const { password, username, email, phoneNumber } = passed.data;
      if (phoneNumber === undefined) {
        handleResponse(res, 400, "Phone number is required to create your account", false, {});
        return;
      }
      const isValidPhone = validator.isMobilePhone(phoneNumber);
      if (!isValidPhone) {
        handleResponse(res, 400, "Phone number is not valid", false, { isValidPhone });
        return;
      }
      const foundUsername = await this.userService.findByUsernameService(username);
      if (foundUsername !== null) {
        handleResponse(res, 400, "Username already exists", false, {
          error: "sign up error",
        });
        return;
      }
      const foundEmail = await this.userService.findByEmailService(email);
      if (foundEmail !== null) {
        handleResponse(res, 400, "Email already exists", false, {
          error: "sign up error",
        });
        return;
      }
      const hashedPassword = await hashPassword(password);
      // create account;
      const {
        id,
        username: uname,
        ...rem
      } = await this.userService.createAccountService({
        password: hashedPassword,
        email,
        username,
        phoneNumber,
      });
      const data = {
        id,
        username: uname,
        ...rem,
      };
      // do email verification
      const { receiver, link } = await emailVerificationSetup(email, "/api/v1/user/account/verify/");
      await sendVerificationEmail(
        receiver,
        link,
        "Welcome to Nagai-Agrotrade",
        `${username}`
      );
      handleResponse(res, httpStatus.CREATED, "account created, check email for for verification link", true, data);
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
      return;
    }
    if (!isValidEmail) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Email is invalid", false, {
        error: "Enter a proper email",
      });
      return;
    }
    // find if the email exists
    const accountExists = await this.userService.findByEmailService(email);
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
      return;
    }
    // check if account is verified
    if (!accountExists.isVerified) {
      handleResponse(res, httpStatus.UNAUTHORIZED, "login error", false, {
        error:
          "Your account has not been verified, check your mail for a verification link or request account verification.",
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

    const { password: passwd, ...rest } = accountExists;
    const data = {
      ...rest,
      accessToken,
      refreshToken,
    };
    handleResponse(res, httpStatus.OK, "Authenticated, user found", true, data);
  }

  async resendVerificationLink(req: Request, res: Response): Promise<void> {
    const parsed = await EmailValidation.safeParseAsync(req.body);
    if (!parsed.success) {
      handleResponse(res, 400, "Invalid email", false, { error: parsed.error });
      return;
    }
    const { email } = parsed.data;
    const account = await this.userService.findByEmailService(email);
    if (account === null) {
      handleResponse(res, 404, "Email not found", false, { error: "Email not found" });
      return;
    }
    if (account.isVerified) {
      handleResponse(res, 400, "Account is already verified", false, { error: "Account is already verified" });
      return;
    }
    const { receiver, link } = await emailVerificationSetup(email, "/api/v1/user/account/verify/");
    await sendVerificationEmail(
      receiver,
      link,
      "Nagai-Agrotrade - Verification Link",
      "Your new verification link, valid for 3 days."
    );
    handleResponse(res, 200, "New verification link sent", true, { message: "New verification link sent" });
  }

  async verifyAccount(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    // check that token is a valid uuid
    const isValidToken = validator.isUUID(token);
    if (!isValidToken) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Token is not valid", false, {
        error: "Request for new verification link",
      });
      return;
    }
    // check for key in redis
    const key = `${String(process.env.REDIS_PREFIX)}-${token}`;
    const keyExists = await redisClient.exists(key);
    if (keyExists === 0) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Invalid email verification link", false, {
        error: "Invalid email verification link, request for a new verification link",
      });
      return;
    }
    const email = await redisClient.get(key);
    if (email === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    const accountFound = await this.userService.findByEmailService(email);
    if (accountFound === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    // change isVerified to true
    await this.userService.updateAccountService(accountFound.id, {
      isVerified: true,
    });
    const WEB_URL =
      process.env.NODE_ENV === "development" ? process.env.LIVE_STAGING_WEB_URL : process.env.LIVE_PROD_WEB_URL;
    res.redirect(`${String(WEB_URL)}/signin?status=verified`);
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    // validate
    const isValidEmail = validator.isEmail(email);
    if (!isValidEmail) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Email is invalid", false, {
        error: "Enter a proper email",
      });
      return;
    }
    // find if the email exists
    const accountExists = await this.userService.findByEmailService(email);
    if (accountExists === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "login error", false, {
        error: "User not found",
      });
      return;
    }
    // send link to reset password
    const { receiver, link } = await emailVerificationSetup(email, "/api/v1/user/account/reset-password-link/");
    await sendVerificationEmail(
      receiver,
      link,
      "Forgot password initiation",
      "You have asked to reset your password, the reset password link is attached, and will expire in 3 days."
    );
    handleResponse(res, httpStatus.OK, "Reset password link sent to mail", true, {
      message: "Please check your mail for reset password link",
    });
  }

  async resetPasswordLink(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    // check that token is a valid uuid
    const isValidToken = validator.isUUID(token);
    if (!isValidToken) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Token is not valid", false, {
        error: "Request for new verification link",
      });
      return;
    }
    // check for key in redis
    const key = `${String(process.env.REDIS_PREFIX)}-${token}`;
    const keyExists = await redisClient.exists(key);
    if (keyExists === 0) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Invalid email verification link", false, {
        error: "Invalid email verification link, request for a new verification link",
      });
      return;
    }
    const email = await redisClient.get(key);
    if (email === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    const accountFound = await this.userService.findByEmailService(email);
    if (accountFound === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    // send reset password link
    await resetPasswordMail(email, accountFound.username);
    res.redirect(`${String(process.env.LIVE_PROD_WEB_URL)}/successreset`);
  }

  async createCheckout(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthRequest).user.id;
    if (userId === null || userId === undefined) {
      handleResponse(res, 401, "Userid is not defined", false, {});
      return;
    }
    const parsed = await CheckoutForm.safeParseAsync(req.body);
    if (parsed.success) {
      const data = await this.userService.createCheckout(parsed.data, userId);
      handleResponse(res, 200, "Checkout form saved successfully", true, { data });
      return;
    }
    handleResponse(res, 400, "Invalid checkout form data passed", false, { error: parsed.error });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    // check that token is a valid uuid
    const isValidToken = validator.isUUID(token);
    if (!isValidToken) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Token is not valid", false, {
        error: "Request for new verification link",
      });
      return;
    }
    // check for key in redis
    const key = `${String(process.env.REDIS_PREFIX)}-${token}`;
    const keyExists = await redisClient.exists(key);
    if (keyExists === 0) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Invalid email verification link", false, {
        error: "Invalid email verification link, request for a new verification link",
      });
      return;
    }
    const email = await redisClient.get(key);
    if (email === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    const accountFound = await this.userService.findByEmailService(email);
    if (accountFound === null) {
      handleResponse(res, httpStatus.NOT_FOUND, "Account not found", false, {
        error: "User account could not be found",
      });
      return;
    }
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      handleResponse(res, httpStatus.BAD_REQUEST, "Passwords don't match", false, {
        error: "password and confirm password don't match",
      });
      return;
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    await this.userService.updateAccountService(accountFound.id, { password: hashedPassword });
    handleResponse(res, httpStatus.CREATED, "Password updated successfully", true, {
      message: "Password for your account has been updated, you can now try to login again",
    });
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
      const accountExists = await this.userService.findByUsernameService(decoded.sessionId);

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
