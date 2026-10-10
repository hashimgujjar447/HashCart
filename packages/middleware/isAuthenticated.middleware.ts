import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../libs/prisma/index.js';
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    if (decoded.role === 'user') {
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          following: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      req.user = user;

      if (!user)
        return res
          .status(401)
          .json({ message: 'Unauthorized: User not found' });
    } else {
      const seller = await prisma.sellers.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone_number: true, // ← add
          country: true, // ← add
          stripeId: true, // ← add
          createdAt: true,
          updatedAt: true,
          shop: true,
        },
      });
      req.seller = seller;

      if (!seller)
        return res
          .status(401)
          .json({ message: 'Unauthorized: User not found' });
    }



    req.role = decoded.role as 'user' | 'seller';

    next();
  } catch (error: any) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    if (
      error instanceof jwt.JsonWebTokenError ||
      error.name === 'JsonWebTokenError'
    ) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return next(error);
  }
};
