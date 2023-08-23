import type { Request, Response } from "express";
import handleResponse from "@utils/appResponse";
import type { NotificationService } from "./notification.service";
import type { AuthRequest } from "@interfaces/basic.types";
import { IdSchema } from "./notification.schema";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async createNotification(req: Request, res: Response): Promise<void> {
    const newNotification = await this.notificationService.createNotification(
      (req as AuthRequest).user.id as string,
      req.body
    );
    handleResponse(res, 201, "Notification created successfully", true, { data: newNotification });
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    const notifications = await this.notificationService.getAllNotifications((req as AuthRequest).user.id as string);
    handleResponse(res, 200, "Notifications retrieved successfully", true, { data: notifications });
  }

  async getNotificationById(req: Request, res: Response): Promise<void> {
    const notificationId = req.params.id;
    const validId = await IdSchema.safeParseAsync(notificationId);

    if (validId.success) {
      const notification = await this.notificationService.getNotificationById(validId.data.id);

      if (notification !== null) {
        handleResponse(res, 200, "Notification retrieved successfully", true, { data: notification });
      } else {
        handleResponse(res, 404, "Notification not found", false, {});
      }
    } else {
      handleResponse(res, 401, "Invalid notification id", false, { error: validId.error });
    }
  }

  async readNotification(req: Request, res: Response): Promise<void> {
    const notificationId = req.params.id;
    const validId = await IdSchema.safeParseAsync({ id: notificationId });

    if (validId.success) {
      const updatedNotification = await this.notificationService.markAsRead(validId.data.id);
      if (updatedNotification !== null) {
        handleResponse(res, 200, "Notification updated successfully", true, {
          data: updatedNotification,
        });
      } else {
        handleResponse(res, 404, "Notification not found", false, {});
      }
    } else {
      handleResponse(res, 401, "Invalid notification id", false, { error: validId.error });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    const notificationId = req.params.id;
    const validId = await IdSchema.safeParseAsync(notificationId);

    if (validId.success) {
      const deleted = await this.notificationService.deleteNotification(validId.data.id);
      if (deleted !== null) {
        handleResponse(res, 200, "Notification deleted successfully", true, {});
      } else {
        handleResponse(res, 404, "Notification not found", false, {});
      }
    } else {
      handleResponse(res, 401, "Invalid notification id", false, { error: validId.error });
    }
  }
}
