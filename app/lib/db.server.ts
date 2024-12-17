import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
const prismaOptions = {
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING
    }
  }
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient(prismaOptions);
  }
  prisma = global.__db__;
}

// Add middleware to handle disconnection and reconnection
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    if (error?.message?.includes('prepared statement') || error?.message?.includes('connection')) {
      console.error('Database connection error:', error);
      // Clean up the existing connection
      await prisma.$disconnect();
      // Create a new connection
      await prisma.$connect();
      // Retry the operation
      return next(params);
    }
    throw error;
  }
});

export const db = prisma;
