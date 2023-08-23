import { type ErrorObject } from "../interfaces/basic.types";
import logger from "../middlewares/winston.middleware";
import chalk from "chalk";
import { type NextFunction, type Request, type Response } from "express";

const sendError = (errorObject: ErrorObject, res: Response): void => {
  logger.error(chalk.red.bold("✖ | Error:"), errorObject);
  res.status(errorObject.statusCode).json({
    status: errorObject.status,
    message: errorObject.message,
    error: errorObject,
    stack: errorObject.stack,
  });
};

export default (errorObject: ErrorObject, _req: Request, res: Response, _next: NextFunction): void => {
  errorObject.statusCode = errorObject.statusCode ?? 500;
  errorObject.status = errorObject.status ?? "error";

  sendError(errorObject, res);
};
