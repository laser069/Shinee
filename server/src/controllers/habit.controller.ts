import { Response } from "express";
import habitService from "../services/habit.service";
import { AuthRequest } from "../middleware/auth.middleware";
import dayjs from "dayjs";

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
    let { habitId, date, dayIndex, value, note, mood } = req.body;

    if (!habitId) {
      return res.status(400).json({ success: false, message: "Habit ID is required." });
    }

    // If dayIndex is provided but date is not, calculate the date for the current week
    if (!date && dayIndex !== undefined) {
      const now = dayjs();
      const day = now.day(); // Sun=0, Mon=1...
      const diff = (day === 0 ? -6 : 1 - day); // Monday of current week
      const weekStart = now.add(diff, 'day').startOf('day');
      date = weekStart.add(dayIndex, 'day').format('YYYY-MM-DD');
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Habit ID and Date (or dayIndex) are required for logging."
      });
    }

    // New Check: Prevent logging for future dates
    if (dayjs(date).isAfter(dayjs(), 'day')) {
      return res.status(400).json({
        success: false,
        message: "Cannot log habits for future dates."
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
    console.error("Create Habit Error:", error.message || error);
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
    console.error("Update Habit Error:", error.message || error);
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