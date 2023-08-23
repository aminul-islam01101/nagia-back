import prisma from "@db/prisma.db";
import type { Notification } from "@prisma/client";
import type { CreateNotificationType } from "./notification.schema";

export class NotificationService {
  async createNotification(accountId: string, data: CreateNotificationType): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        ...data,
        account: {
          connect: {
            id: accountId,
          },
        },
      },
    });
  }

  async getAllNotifications(accountId: string): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    return await prisma.notification.findUnique({
      where: { id: notificationId },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async deleteNotification(notificationId: string): Promise<Notification> {
    return await prisma.notification.delete({ where: { id: notificationId } });
  }
}
