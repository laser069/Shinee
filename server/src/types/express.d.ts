import 'express';

declare global {
  namespace Express {
    interface Request {
      // This tells TS that 'user' exists on every 'req' object
      user?: {
        id: string;
        isAdmin: boolean;
      };
    }
  }
}