import { type ObjectOrMessage, type ResponseType } from "@interfaces/basic.types";
import { type Response } from "express";

const formatMessage = (objectOrMessage: ObjectOrMessage): string => {
  return typeof objectOrMessage === "string"
    ? objectOrMessage
    : typeof objectOrMessage === "object" && typeof objectOrMessage?.message === "string"
    ? objectOrMessage.message
    : "";
};

export const createResponse = <T>(
  objectOrMessage: ObjectOrMessage,
  data: Record<string, T>,
  status: boolean = false
): ResponseType<T> => {
  return {
    status: !status ? "failure" : "success",
    message: formatMessage(objectOrMessage),
    data,
  };
};

export default function handleResponse<T>(
  res: Response,
  status: number,
  message: ObjectOrMessage,
  success: boolean,
  data: Record<string, T> 
): void {
  res.status(status).json(createResponse(message, data, success));
}
