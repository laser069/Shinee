import { Response } from "express";
import { HabitService } from "../services/habit.service";
import { HabitValidationSchema, LogValidationSchema } from "../schemas/habit.schema";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const habitService = new HabitService();

export class HabitController {
  /**
   * Helper to handle Zod errors consistently
   */
  private sendZodError(res: Response, error: z.ZodError) {
    // .flatten() makes the error object much cleaner for the frontend
    return res.status(400).json({ 
      success: false, 
      message: "Validation failed",
      errors: error.flatten().fieldErrors 
    });
  }

  async createHabit(req: AuthRequest, res: Response) {
    try {
      const validatedData = HabitValidationSchema.parse(req.body);
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      
      const habit = await habitService.createHabit(req.user.id, validatedData);
      res.status(201).json({ success: true, data: habit });
    } catch (error) {
      if (error instanceof z.ZodError) return this.sendZodError(res, error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  async logActivity(req: AuthRequest, res: Response) {
    try {
      const validatedLog = LogValidationSchema.parse(req.body);
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await habitService.logActivity(req.user.id, validatedLog);
      res.status(200).json({
        success: true,
        message: `Earned ${result.pointsAwarded} points!`,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) return this.sendZodError(res, error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async handleRelapse(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      
      const habit = await habitService.handleRelapse(req.user.id, id);
      res.status(200).json({ success: true, message: "Streak reset!", data: habit });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      
      const habits = await habitService.getHabitProgress(req.user.id);
      res.status(200).json({ success: true, data: habits });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}