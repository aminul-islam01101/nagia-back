import auth, { requireUser } from "@middlewares/auth.middleware";
import { asyncHandler } from "@utils/async.handler";
import { Router } from "express";
import { AdminModule } from "./admin.module";

const router = Router();
const adminModule = new AdminModule();


/**
 * @swagger
 * tags:
 *   name: Admin 
 *   description: Admin Account Management
 */

/**
 * @swagger
 * /api/v1/admin/account/signup:
 *   post:
 *     summary: Create a new user account.
 *     tags: [Admin]
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
router.post("/signup", asyncHandler(adminModule.adminController.signup.bind(adminModule)))

/**
 * @swagger
 * /api/v1/admin/account/login:
 *   post:
 *     summary: Login an existing admin.
 *     tags: [Admin]
 *     requestBody:
 *       description: Admin credentials.
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
 *         description: Admin not found error.
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
router.post("/login", asyncHandler(adminModule.adminController.login.bind(adminModule)))

/**
 * @swagger
 * /api/v1/admin/account/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes access token with provided refresh token
 *     tags: [Admin]
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
router.post("/refresh-token", asyncHandler(adminModule.adminController.refreshToken.bind(adminModule)));

/**
 * @swagger
 * /api/v1/admin/account/logout:
 *   post:
 *     summary: Logout admin user.
 *     description: This endpoint logs out the currently logged in admin user by invalidating their session and removing their access and refresh tokens.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Admin logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Admin not authenticated.
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
router.get("/logout", auth, requireUser, asyncHandler(adminModule.adminController.logout.bind(adminModule)))

export default router;
