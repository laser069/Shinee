import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Catches every request that matched no route.
 * Without this Express replies with its default HTML error page, which is
 * unparseable by any JSON client.
 */
export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Single exit point for every error. Always replies with the
 * `{ success, message }` envelope the rest of the API uses.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Express can only take over the response if nothing has been sent yet.
  if (res.headersSent) return;

  let status = 500;
  let message = "Internal server error";
  let issues: unknown;

  if (err instanceof ZodError) {
    status = 400;
    message = "Request validation failed";
    issues = err.issues;
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    status = 401;
    message = "Not authorized, token failed";
  } else if (err?.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path ?? "identifier"}`;
  } else if (err?.name === "ValidationError") {
    status = 400;
    message = err.message ?? "Validation failed";
  } else if (typeof err?.status === "number" || typeof err?.statusCode === "number") {
    status = err.status ?? err.statusCode;
    message = err.message ?? message;
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Payload too large";
  }

  if (status >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(issues ? { errors: issues } : {}),
    ...(process.env.NODE_ENV !== "production" && status >= 500 && err?.stack
      ? { stack: err.stack }
      : {})
  });
};
