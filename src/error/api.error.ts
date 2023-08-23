export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  date: Date;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.date = new Date();
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", statusCode = 400) {
    super(message, statusCode);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Something wrong happened", statusCode = 500) {
    super(message, statusCode);
  }
}

export class BadGatewayError extends AppError {
  constructor(
    message = "The server encountered a temporary error & could not complete your request",
    statusCode = 502
  ) {
    super(message, statusCode);
  }
}

export class UnAuthorizedError extends AppError {
  constructor(message = "Not authorized", statusCode = 401) {
    super(message, statusCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden", statusCode = 403) {
    super(message, statusCode);
  }
}

export class ExpectationFailedError extends AppError {
  constructor(message = "Expected inputs were not supplied", statusCode = 417) {
    super(message, statusCode);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource not found", statusCode = 404) {
    super(message, statusCode);
  }
}

export class InvalidError extends AppError {
  constructor(message = "Invalid input", statusCode = 422) {
    super(message, statusCode);
  }
}

export class DuplicateError extends AppError {
  constructor(message = "Duplicate value entered", statusCode = 406) {
    super(message, statusCode);
  }
}
