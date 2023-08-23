import { type NextFunction, type Request, type Response } from "express";

export function asyncHandler<T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
// Decorator function
export default function asyncMethod(
  _target: unknown,
  _propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  descriptor.value = asyncHandler(originalMethod);
  return descriptor;
}
