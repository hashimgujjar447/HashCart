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
    const account = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        following: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    req.user = account;

    if (!account) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    next();
  } catch (error) {
    return next(error);
  }
};
