import { PrismaClient } from '../../../generated/prisma/index.js';

declare global {
  namespace globalThis {
    var prismaDb: PrismaClient;
  }
}

const prisma = global.prismaDb || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prismaDb = prisma;

export default prisma;

