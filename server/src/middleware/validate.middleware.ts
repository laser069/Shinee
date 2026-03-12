import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Reassigning req.body ensures that Zod defaults are applied
      // and extra fields are stripped if the schema is strict.
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      console.error("Zod Validation Error:", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ 
        success: false, 
        message: "Request validation failed",
        errors: error.errors 
      });
    }
  };