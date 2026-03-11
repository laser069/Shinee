import { Response } from "express";
import { HabitService } from "../services/habit.service";
import { HabitValidationSchema, LogValidationSchema } from "../schemas/habit.schema";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

// Initialize the service once for all functions to use
const habitService = new HabitService();

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 */
export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // req.body is already validated by your 'validate' middleware
    const habit = await habitService.createHabit(userId, req.body);
    
    res.status(201).json({ 
      success: true, 
      data: habit 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/habits/log
 * @desc    Update progress, calculate streaks and points
 */
export const logActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await habitService.logActivity(userId, req.body);

    res.status(200).json({
      success: true,
      message: `Earned ${result.pointsAwarded} points!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/habits
 * @desc    Fetch all habits with current progress for the dashboard
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const habits = await habitService.getHabitProgress(userId);

    res.status(200).json({
      success: true,
      data: habits,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PATCH /api/habits/:id/relapse
 * @desc    Reset streaks for sobriety/quit habits
 */
export const handleRelapse = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const habit = await habitService.handleRelapse(userId, id);

    res.status(200).json({
      success: true,
      message: "Streak reset. Stay strong!",
      data: habit,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/habits/:id/stats
 * @desc    Get countdown/sobriety stats for 'Quit' habits
 */
export const getQuitStats = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const stats = await habitService.getQuitStats(userId, id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};