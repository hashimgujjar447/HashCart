import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../error-handler/index.js';

export const isSeller = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.role !== 'seller') {
    return next(
      new AuthError(
        'Access Denied: Sellers only. Please log in as a seller to access this resource.',
      ),
    );
  }
  return next();
};

export const isUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.role !== 'user') {
    return next(
      new AuthError(
        'Access Denied: Users only. Please log in as a user to access this resource.',
      ),
    );
  }
  return next();
};

export const authorizeRoles = (...roles: ('user' | 'seller')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return next(
        new AuthError(
          `Access Denied: Only ${roles.join(', ')} can access this resource.`,
        ),
      );
    }
    return next();
  };
};

