import { Request, Response, NextFunction } from "express";

export interface ErrnoException extends Error {
  stack?: string;
  statusCode?: number;
}

// Error handler middleware
const errorHandler = (err: ErrnoException, req: Request, res: Response) => {
  // set status code
  const statusCode = err.statusCode || 400;

  // set message based on status code & send json response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // only show stack in development mode
  });
};

// Not found error
class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

const notFound = (req: Request, res: Response, next: NextFunction) => {
  let error = new NotFoundError(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { errorHandler, notFound };
