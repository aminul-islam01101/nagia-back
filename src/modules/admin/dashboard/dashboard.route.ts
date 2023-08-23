import auth from "@middlewares/auth.middleware";
import { checkRoles, isAdmin } from "@middlewares/checkRole.middleware";
import { asyncHandler } from "@utils/async.handler";
import { Router } from "express";
import { DashboardModule } from "./dashboard.module";

const router = Router();
const dashboardModule = new DashboardModule();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard endpoints
 */

/**
 * @swagger
 * /api/v1/admin/dashboard/users:
 *   get:
 *     summary: Get all users
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: A list of all users
 */
router.get("/users", auth, isAdmin, asyncHandler(dashboardModule.dashboardController.getUsers.bind(dashboardModule)));

/**
 * @swagger
 * /api/v1/admin/dashboard/users/send-mail:
 *   post:
 *     summary: Send mail to users
 *     tags: [Dashboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                type: string
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
router.post(
  "/users/send-mail",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.sendMailToUsers.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
  "/users/:id",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.deleteUser.bind(dashboardModule))
);

/**
 * @swagger
 *  /api/v1/admin/dashboard/transactions/approve:
 *    patch:
 *      tags: [Dashboard]
 *      summary: Approve a transaction
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ApproveTransaction'
 *      responses:
 *        200:
 *          description: Transaction approved successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                  message:
 *                    type: string
 *        401:
 *          description: Invalid transactionId
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                  message:
 *                    type: string
 *                  error:
 *                    type: string
 */
router.patch(
  "/transactions/approve",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.approveTransaction.bind(dashboardModule))
);

/**
 * @swagger
 *  /api/v1/admin/dashboard/transaction/approve/sell:
 *    get:
 *      tags: [Dashboard]
 *      summary: Get products users want to sell for approval
 *
 *      responses:
 *        201:
 *          description: Investor news added successfully
 *          content:
 *            application/json:
 *              schema:
 *                    $ref: '#/components/schemas/SuccessResponse'
 *        401:
 *          description: Invalid data passed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/transaction/approve/sell",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.getSellProducts.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/transactions:
 *   get:
 *     summary: Retrieve a list of all transactions
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SuccessResponse'
 */
router.get(
  "/transactions",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.getAllTransactions.bind(dashboardModule))
);

/**
 * @swagger
 *  /api/v1/admin/dashboard/investor-news:
 *    post:
 *      tags: [Dashboard]
 *      summary: Add investment news
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InvestmentNews'
 *      responses:
 *        201:
 *          description: Investor news added successfully
 *          content:
 *            application/json:
 *              schema:
 *                    $ref: '#/components/schemas/SuccessResponse'
 *        401:
 *          description: Invalid data passed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/investor-news",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.addInvestmentNews.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-news:
 *   get:
 *     summary: Get all investment news
 *     tags: [Investment News]
 *     responses:
 *       200:
 *         description: A list of investment news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InvestmentNews'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/investor-news",
  auth,
  asyncHandler(dashboardModule.dashboardController.getAllInvestmentNews.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investment-news/{newsId}:
 *   get:
 *     summary: Get investment news by ID
 *     tags: [Investment News]
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Investment news details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestmentNews'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment news not found
 */
router.get(
  "/investment-news/:newsId",
  auth,
  checkRoles("ADMIN"),
  asyncHandler(dashboardModule.dashboardController.getNewsById.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-news/{id}:
 *   patch:
 *     summary: Update investment news
 *     tags: [Investment News]
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNewsSchema'
 *     responses:
 *       200:
 *         description: Investment news updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestmentNews'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment news not found
 */
router.patch(
  "/investor-news/:id",
  auth,
  checkRoles("ADMIN"),
  asyncHandler(dashboardModule.dashboardController.updateNews.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-news/{newsId}:
 *   delete:
 *     summary: Delete investment news
 *     tags: [Investment News]
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Investment news deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment news not found
 */
router.delete(
  "/investor-news/:id",
  auth,
  checkRoles("ADMIN"),
  asyncHandler(dashboardModule.dashboardController.deleteNews.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-opportunities:
 *   get:
 *     summary: Get all investment opportunities
 *     tags: [Investment Opportunities]
 *     responses:
 *       200:
 *         description: A list of investment opportunities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InvestmentOpportunities'
 *       400:
 *         description: Bad Request
 */
router.get(
  "/investor-opportunities",
  asyncHandler(dashboardModule.dashboardController.getAllInvestmentOpportunity.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-opportunities/{opportunityId}:
 *   get:
 *     summary: Get investment opportunity by ID
 *     tags: [Investment Opportunities]
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Investment opportunity details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestmentOpportunities'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment opportunity not found
 */
router.get(
  "/investor-opportunities/:opportunityId",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.getOpportunityById.bind(dashboardModule))
);

/**
 * @swagger
 *  /api/v1/admin/dashboard/investor-opportunities:
 *    post:
 *      tags: [Dashboard]
 *      summary: Add investment opportunity
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InvestmentOpportunities'
 *      responses:
 *        201:
 *          description: Investor opportunity added successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SuccessResponse'
 *        401:
 *          description: Invalid data passed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/investor-opportunities",
  auth,
  isAdmin,
  asyncHandler(dashboardModule.dashboardController.addInvestmentOpportunity.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-opportunities/{id}:
 *   patch:
 *     summary: Update investment opportunity
 *     tags: [Investment Opportunities]
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOpportunitySchema'
 *     responses:
 *       200:
 *         description: Investment opportunity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvestmentOpportunities'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment opportunity not found
 */
router.patch(
  "/investor-opportunities/:id",
  auth,
  checkRoles("ADMIN"),
  asyncHandler(dashboardModule.dashboardController.updateOpportunity.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/investor-opportunities/{id}:
 *   delete:
 *     summary: Delete investment opportunity
 *     tags: [Investment Opportunities]
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Investment opportunity deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Investment opportunity not found
 */
router.delete(
  "/investor-opportunities/:id",
  auth,
  checkRoles("ADMIN"),
  asyncHandler(dashboardModule.dashboardController.deleteOpportunity.bind(dashboardModule))
);

/**
 * @swagger
 * /api/v1/admin/dashboard/account-details/{accountId}:
 *   get:
 *     summary: Retrieve account details by accountId
 *     tags: [Dashboard]
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
 * /api/v1/admin/dashboard/payment-details/{accountId}:
 *   get:
 *     summary: Retrieve payment details by accountId
 *     tags: [Dashboard]
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
 *  /api/v1/admin/dashboard/verify-payment:
 *    post:
 *      tags: [Dashboard]
 *      summary: Verify user payment 
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/InvestmentOpportunities'
 *      responses:
 *        201:
 *          description: Investor opportunity added successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SuccessResponse'
 *        401:
 *          description: Invalid data passed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/verify-payment", auth, isAdmin, asyncHandler(dashboardModule.dashboardController.verifyUserPayment.bind(dashboardModule)));

export default router;
