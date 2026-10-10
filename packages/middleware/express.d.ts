import { users, sellers, shops } from '../../generated/prisma/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<users, 'password'> | null;
      seller?: (Omit<sellers, 'password'> & { shop: shops | null }) | null;
      role?: 'user' | 'seller';
    }
  }
}
