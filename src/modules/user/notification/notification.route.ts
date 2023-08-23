import auth from "@middlewares/auth.middleware";
import { asyncHandler } from "@utils/async.handler";
import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

const notificationController = new NotificationController(new NotificationService());
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - id
 *         - message
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated unique ID for the notification.
 *         message:
 *           type: string
 *           description: The content of the notification.
 *         userId:
 *           type: string
 *           description: The ID of the user associated with the notification.
 */

/**
 * @swagger
 * /api/v1/user/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: A list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get("/", auth, asyncHandler(notificationController.getNotifications.bind(notificationController)));

/**
 * @swagger
 * /api/v1/user/notifications/{id}:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get a notification by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: Notification found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 */
router.get("/:id", auth, asyncHandler(notificationController.getNotificationById.bind(notificationController)));

// /**
//  * @swagger
//  * /api/v1/user/notifications:
//  *   post:
//  *     tags:
//  *       - Notifications
//  *     summary: Create a new notification
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/Notification'
//  *     responses:
//  *       201:
//  *         description: Notification created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Notification'
//  *       400:
//  *         description: Invalid notification data
//  */
// router.post("/", auth, asyncHandler(notificationController.createNotification.bind(notificationController)));

/**
 * @swagger
 * api/v1/user/notifications/{id}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete a notification by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", auth, asyncHandler(notificationController.deleteNotification.bind(notificationController)));

/**
 * @swagger
 * /api/v1/user/notifications/{id}/mark-as-read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a notification as read by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/mark-as-read", auth, asyncHandler(notificationController.readNotification.bind(notificationController)));

export default router;
