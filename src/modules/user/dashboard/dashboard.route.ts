import auth from "@middlewares/auth.middleware";
import { checkRoles } from "@middlewares/checkRole.middleware";
import { asyncHandler } from "@utils/async.handler";
import { Router } from "express";
import { DashboardModule } from "./dashboard.module";

const router = Router();

const dashboardModule = new DashboardModule();

/**
 * @swagger
 * tags:
 *   name: UserDashboard
 *   description: Endpoints for user dashboard
 */

/**
 * @swagger
 * /api/v1/user/dashboard/news:
 *   get:
 *     summary: Retrieve a list of news
 *     tags: [UserDashboard]
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         required: true
 *         description: The page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: true
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: A list of news
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 *                   properties:
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: array
 *                             items:
 *                               type: string
 *                           message:
 *                             type: string
 */
router.get("/news", auth, asyncHandler(dashboardModule.dashboardController.getNews.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/opportunity:
 *   get:
 *     tags:
 *       - UserDashboard
 *     summary: Get an investment opportunity
 *     description: Retrieve a specific investment opportunity using pagination parameters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to fetch (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items to fetch per page (default is 10)
 *     responses:
 *       200:
 *         description: Opportunity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/opportunity", asyncHandler(dashboardModule.dashboardController.getOpportunity.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/opportunity/{id}:
 *   get:
 *     tags:
 *       - UserDashboard
 *     summary: Get an investment opportunity by id
 *     description: Retrieve a specific investment opportunity
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Opportunity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/opportunity/:id",
  auth,
  asyncHandler(dashboardModule.dashboardController.getOpportunityById.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/buy:
 *   post:
 *     tags:
 *       - Investment
 *     summary: Buy a product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuyProduct'
 *     responses:
 *       200:
 *         description: Product bought successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid data passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/buy", auth, asyncHandler(dashboardModule.dashboardController.buyProduct.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/paystack/verify?reference=oiio&userInvestmentId=ioi09&checkoutId=8cc3838938:
 *   post:
 *     tags:
 *       - Investment
 *     summary: Confirm payment reference
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *
 *     responses:
 *       200:
 *         description: Product bought successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid data passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/paystack/verify",
  auth,
  asyncHandler(dashboardModule.dashboardController.handlePaystackCallback.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/sell:
 *   post:
 *     tags:
 *       - Investment
 *     summary: Sell a product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellProduct'
 *     responses:
 *       200:
 *         description: Product sold successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid data passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/sell", auth, asyncHandler(dashboardModule.dashboardController.sellProduct.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/checkout:
 *   get:
 *     tags:
 *       - UserDashboard
 *     summary: Get checkout details
 *     description: Retrieve users checkout details
 *     responses:
 *       200:
 *         description: Checkout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/checkout", auth, asyncHandler(dashboardModule.dashboardController.getCheckoutInfo.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/flutterwave/verify?status=successfull&tx_ref=9090&transaction_id=90&userInvestmentId=09h0h:
 *   post:
 *     tags:
 *       - Investment
 *     summary: Confirm payment reference
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *
 *     responses:
 *       200:
 *         description: Product bought successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid data passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  "/flutterwave/verify",
  auth,
  asyncHandler(dashboardModule.dashboardController.handlePaystackCallback.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/{id}/investment:
 *   get:
 *     summary: Get user investment details
 *     tags: [UserDashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User investment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserInvestment'
 *       404:
 *         description: User investment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/investment",
  auth,
  asyncHandler(dashboardModule.dashboardController.getUserInvestment.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/password:
 *   put:
 *     summary: Update user password
 *     tags: [Account]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdatePassword"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Response"
 *       400:
 *         description: Invalid data or current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Response"
 */
router.patch("/password", auth, asyncHandler(dashboardModule.dashboardController.updatePassword.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/user/dashboard/user-info:
 *   put:
 *     summary: Update user information
 *     tags: [Account]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateUserInfo"
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       400:
 *         description: Invalid data passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/user-info",
  auth,
  asyncHandler(dashboardModule.dashboardController.updateUserInfo.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/transaction-history:
 *   get:
 *     tags:
 *       - UserDashboard
 *     summary: Get user's transaction history
 *     description: Retrieve the user's transaction history
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.get(
  "/transaction-history",
  auth,
  asyncHandler(dashboardModule.dashboardController.getTransactionHistory.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/account-details:
 *   post:
 *     tags:
 *       - UserDashboard
 *     summary: Add account details
 *     description: Add account details for the authenticated user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountDetails'
 *     responses:
 *       201:
 *         description: Account details added successfully
 */
router.post(
  "/account-details",
  auth,
  checkRoles("INVESTOR"),
  asyncHandler(dashboardModule.dashboardController.addAccountDetails.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/payment-details:
 *   post:
 *     tags:
 *       - UserDashboard
 *     summary: Add payment details
 *     description: Add payment details for the authenticated user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentDetails'
 *     responses:
 *       201:
 *         description: Payment details added successfully
 */
router.post(
  "/payment-details",
  auth,
  checkRoles("INVESTOR"),
  asyncHandler(dashboardModule.dashboardController.addPaymentDetails.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/account-details/{accountId}:
 *   get:
 *     summary: Retrieve account details by accountId
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: The accountId
 *     responses:
 *       200:
 *         description: The account details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDetails'
 */
router.get(
  "/account-details/:accountId",
  auth,
  asyncHandler(dashboardModule.dashboardController.getAccountDetails.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/payment-details/{accountId}:
 *   get:
 *     summary: Retrieve payment details by accountId
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: The accountId
 *     responses:
 *       200:
 *         description: The payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDetails'
 */
router.get(
  "/payment-details/:accountId",
  auth,
  asyncHandler(dashboardModule.dashboardController.getPaymentDetails.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     description: Returns transaction data grouped by day, week, and month.
 *     tags:
 *       - Transactions
 *     responses:
 *       200:
 *         description: Transaction statistics per day, week, and month.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 daily:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 weekly:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 monthly:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *       500:
 *         description: An error occurred while fetching transaction stats.
 */
router.get(
  "/transactions/stats",
  auth,
  asyncHandler(dashboardModule.dashboardController.getTransactionStats.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/user/dashboard/investment-stats:
 *   get:
 *     tags:
 *       - Investment Stats
 *     summary: Calculate investment statistics for a user
 *     description: Fetches and calculates total investment, active investment, gross yield, net yield, and potential equity for a user.
 *     responses:
 *       200:
 *         description: Investment statistics calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInvestment:
 *                   type: number
 *                   description: The total amount invested by the user
 *                 activeInvestment:
 *                   type: number
 *                   description: The total amount of active investments
 *                 grossYield:
 *                   type: number
 *                   description: The total gross yield for the user's investments
 *                 netYield:
 *                   type: number
 *                   description: The total net yield for the user's investments, after accounting for fees and expenses
 *                 potentialEquity:
 *                   type: number
 *                   description: The potential equity for the user's investments, based on their growth rate
 *       400:
 *         description: Invalid userId provided
 *       500:
 *         description: Internal server error
 */
router.get(
  "/investment-stats",
  auth,
  asyncHandler(dashboardModule.dashboardController.calcInvestmentStats.bind(dashboardModule))
);

export default router;
