import { Response } from "express";
import habitService from "../services/habit.service";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * GET /api/habits/dashboard
 * Fetches the 7-day Notion grid for all active habits
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Optional: Sync streaks whenever the user opens the app to ensure data is fresh
    await habitService.syncStreaks(userId);

    const dashboardData = await habitService.getWeeklyDashboard(userId);

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/habits/toggle
 * The primary "Checkbox" action. Also handles numeric logs & notes.
 */
export const toggleActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { habitId, date, value, note, mood } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({
        success: false,
        message: "Habit ID and Date are required for logging."
      });
    }

    const result = await habitService.toggleActivity(userId, {
      habitId,
      date,
      value,
      note,
      mood
    });

    res.status(200).json({
      success: true,
      message: `Activity ${result.action}`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/habits
 * Create a new habit template (defines schedule, target, and UI)
 */
export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const habit = await habitService.createHabit(userId, req.body);

    res.status(201).json({
      success: true,
      data: habit
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/habits/:id
 * Edit habit settings (Schedule, Target, Color, Icon)
 */
export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const habit = await habitService.updateHabit(userId, id, req.body);

    res.status(200).json({
      success: true,
      message: "Habit configuration updated",
      data: habit
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/habits/:id/archive
 * Hide habit from view without deleting history
 */
export const archiveHabit = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    await habitService.archiveHabit(userId, id);

    res.status(200).json({
      success: true,
      message: "Habit archived successfully"
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


/**
 * DELETE /api/habits/:id
 * Completely removes a habit and all its historical log data.
 */
export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    // The service handles deleting both the Habit and the associated Logs
    await habitService.deleteHabit(userId, id);

    res.status(200).json({
      success: true,
      message: "Habit and all historical data deleted permanently"
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};