import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClient: PrismaClient = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismaClient;

export default prismaClient;
