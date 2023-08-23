import { asyncHandler } from "@utils/async.handler";
import { Router } from "express";
import { ContactUsModule } from "./contactUs.module";

const router = Router();
const contactUsModule = new ContactUsModule();

/**
 * @swagger
 * tags:
 *   name:  ContactUs 
 *   description: ContactUs Module
 */

/**
 * @swagger
 * /api/v1/contact-us:
 *   post:
 *     summary: Sends a message to the website admin
 *     tags: [ContactUs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactUs'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 */
router.post("/contact-us", asyncHandler(contactUsModule.contactUsController.save.bind(contactUsModule)));

export default router;
