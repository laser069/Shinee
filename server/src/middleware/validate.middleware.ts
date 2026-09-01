import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Reassigning req.body ensures that Zod defaults are applied
      // and extra fields are stripped if the schema is strict.
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // Zod v4 exposes the issue list as `.issues` (`.errors` is gone).
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Request validation failed",
          errors: error.issues
        });
      }
      // Anything that is not a validation failure is a real error - hand it to
      // the global error handler instead of masking it as a 400.
      return next(error);
    }
  };
