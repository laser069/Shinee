import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({ errors: error.errors });
    }
  };