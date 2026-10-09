import { users } from '../../generated/prisma/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<users, 'password'> | null;
    }
  }
}
