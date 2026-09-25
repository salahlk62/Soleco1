import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance across the app (avoid exhausting DB connections
// by instantiating a new PrismaClient in every service file).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
