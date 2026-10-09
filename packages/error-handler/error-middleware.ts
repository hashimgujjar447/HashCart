import { NextFunction, Request, Response } from 'express';
import { AppError } from './index.js';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    console.error(`Error ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.status).json({
      status: 'error',
      message: err.message,
      ...(err.details !== undefined && {
        details: err.details,
      }),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Token expired',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid token',
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong, please try again!',
  });
};
