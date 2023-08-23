import { z } from "zod";

export const CreateNotificationSchema = z.object({
  message: z.string(),
});

export type CreateNotificationType = z.infer<typeof CreateNotificationSchema>;

export const IdSchema = z.object({
  id: z.string().cuid(),
});

export type IdType = z.infer<typeof IdSchema>;
