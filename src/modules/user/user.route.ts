import { asyncHandler } from "../../utils/async.handler";
import { Router } from "express";
import { UserModule } from "./user.module";
import auth, { requireUser } from "@middlewares/auth.middleware";

const router = Router();
const userModule = new UserModule();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Account Management
 */

/**
 * @swagger
 * /api/v1/user/account/signup:
 *   post:
 *     summary: Create a new user account.
 *     tags: [User]
 *     requestBody:
 *       description: User details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignupRequest'
 *     responses:
 *       201:
 *         description: Account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/signup", asyncHandler(userModule.userController.signup.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/login:
 *   post:
 *     summary: Login an existing user.
 *     tags: [User]
 *     requestBody:
 *       description: User credentials.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", asyncHandler(userModule.userController.login.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/resend-verification-link:
 *   post:
 *     summary: Resend verification link
 *     description: Generate and send a new verification link to the user's email
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: New verification link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: New verification link sent
 *       400:
 *         description: Invalid email or account is already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Email not found
 */
router.post(
  "/resend-verification-link",
  asyncHandler(userModule.userController.resendVerificationLink.bind(userModule))
);

/**
 * @swagger
 * /api/v1/user/account/verify/{token}:
 *   get:
 *     summary: Verify user account
 *     description: Verify a user account using a unique token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Unique token used to verify user account
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to a success page on successful verification
 *       400:
 *         description: Invalid token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/verify/:token", asyncHandler(userModule.userController.verifyAccount.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     description: Initiate password reset by sending a reset password link to user email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       description: User email to initiate password reset
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password link sent to user email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid email provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/forgot-password", asyncHandler(userModule.userController.forgotPassword.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/reset-password-link/{token}:
 *   get:
 *     summary: Send reset password link
 *     description: Send reset password link to user email using a unique token
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Unique token used to send reset password link
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reset password link sent to user email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/reset-password-link/:token", asyncHandler(userModule.userController.resetPasswordLink.bind(userModule)));

/**
 * @swagger
 *
 * /api/v1/user/account/reset-password/{token}:
 *   post:
 *     summary: Reset user's password.
 *     description: This endpoint allows a user to reset their password by providing a valid reset token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The reset token received by the user's email.
 *     requestBody:
 *       description: The new password and confirm password.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: User account not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/reset-password/:token", asyncHandler(userModule.userController.resetPassword.bind(userModule)));


/**
 * @swagger
 * /api/v1/user/account/checkout:
 *   post:
 *     summary: Create checkout details.
 *     tags: [User]
 *     requestBody:
 *       description: User details.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignupRequest'
 *     responses:
 *       201:
 *         description: Account created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/checkout", auth, asyncHandler(userModule.userController.createCheckout.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes access token with provided refresh token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Refresh token for the user
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Returns a new set of access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid or missing token
 *       403:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Could not verify token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: User not found
 */
router.post("/refresh-token", asyncHandler(userModule.userController.refreshToken.bind(userModule)));

/**
 * @swagger
 * /api/v1/user/account/logout:
 *   post:
 *     summary: Logout user.
 *     description: This endpoint logs out the currently logged in user by invalidating their session and removing their access and refresh tokens.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/logout", auth, requireUser, asyncHandler(userModule.userController.logout.bind(userModule)));

export default router;
