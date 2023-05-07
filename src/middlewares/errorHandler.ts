import { Request, Response, NextFunction } from "express";

export interface ErrnoException extends Error {
  stack?: string;
  statusCode?: number;
}

// error handler middleware
const errorHandler = (
  err: ErrnoException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  // set status code
  const statusCode = err.statusCode || 400;

  // set message based on status code & send json response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // only show stack in development mode
  });
};

// invalid path error handler middleware
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(err);
};

export { errorHandler, notFound };
