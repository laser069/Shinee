import { Habit, Log } from "../models/Habit";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  subWeeks,
  format
} from "date-fns";

export class HabitService {
  private readonly XP_MAP = { easy: 10, medium: 25, hard: 50 };

  /**
   * 1. GET WEEKLY DASHBOARD (The Notion Sheet)
   * Fetches habits and overlays logs for the current week grid.
   */
  async getWeeklyDashboard(userId: string) {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 });     // Sunday

    const habits = await Habit.find({ userId, isArchived: false });
    const logs = await Log.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    const weekDays = eachDayOfInterval({ start, end });

    return habits.map(habit => {
      // Build the 7-day grid
      const grid = weekDays.map(dayDate => {
        const dayLog = logs.find(l =>
          l.habitId.toString() === habit._id.toString() &&
          isSameDay(new Date(l.date), dayDate)
        );

        return {
          date: dayDate,
          isCompleted: habit.goal.type === 'boolean'
            ? !!dayLog
            : (dayLog?.value || 0) >= habit.goal.targetValue,
          currentValue: dayLog?.value || 0,
          isScheduled: habit.goal.scheduledDays.length > 0
            ? habit.goal.scheduledDays.includes(dayDate.getDay())
            : true,
          note: dayLog?.note || null,
          mood: dayLog?.mood || null
        };
      });

      // Calculate Weekly Progress
      const completedCount = grid.filter(g => g.isCompleted).length;
      const target = habit.goal.scheduledDays.length > 0
        ? habit.goal.scheduledDays.length
        : (habit.goal.weeklyTarget || 7);

      const progress = Math.min(Math.round((completedCount / target) * 100), 100);

      return {
        ...habit.toObject(),
        grid,
        weeklyProgress: progress,
        weeklyStats: `${completedCount}/${target}`
      };
    });
  }

  /**
   * 2. TOGGLE DAY / LOG ACTIVITY
   * Handles XP calculation, multiplier logic, and checkbox toggling.
   */
  async toggleActivity(userId: string, data: {
    habitId: string,
    date: string,
    value?: number,
    note?: string,
    mood?: number
  }) {
    const { habitId, date, value, note, mood } = data;
    const targetDate = startOfDay(new Date(date));

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new Error("Habit not found");

    const existingLog = await Log.findOne({ userId, habitId, date: targetDate });

    // Handle UNCHECK (Toggle off)
    if (existingLog && habit.goal.type === 'boolean' && value === undefined) {
      await Log.deleteOne({ _id: existingLog._id });
      return { action: 'removed' };
    }

    // Calculate XP with Multiplier
    // Formula: Base XP * Multiplier (Multiplier grows with streaks)
    const baseXP = this.XP_MAP[habit.goal.difficulty];
    const earnedXP = Math.round(baseXP * (habit.stats.multiplier || 1.0));

    if (existingLog) {
      // Update existing numeric log or metadata
      existingLog.value = value ?? existingLog.value;
      existingLog.note = note ?? existingLog.note;
      existingLog.mood = mood ?? existingLog.mood;
      await existingLog.save();
      return { action: 'updated', log: existingLog };
    } else {
      // Create New Log
      const newLog = await Log.create({
        userId,
        habitId,
        date: targetDate,
        value: value ?? habit.goal.targetValue,
        note,
        mood,
        pointsEarned: earnedXP
      });

      // Update Habit Stats: Total XP and Completions
      await Habit.updateOne(
        { _id: habitId },
        {
          $inc: { "stats.totalXP": earnedXP, "stats.totalCompletions": 1 },
          $set: { "stats.lastCompletedDate": new Date() }
        }
      );

      return { action: 'created', log: newLog };
    }
  }

  /**
   * 3. SYNC STREAKS (The "Validator")
   * This checks if the user hit their goals last week to increment streaks.
   * Best run on dashboard load or via a cron job.
   */
  async syncStreaks(userId: string) {
    const habits = await Habit.find({ userId, isArchived: false });
    const now = new Date();

    // Check previous week (Monday - Sunday)
    const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    for (const habit of habits) {
      const logsCount = await Log.countDocuments({
        habitId: habit._id,
        date: { $gte: prevWeekStart, $lte: prevWeekEnd }
      });

      const target = habit.goal.scheduledDays.length > 0
        ? habit.goal.scheduledDays.length
        : (habit.goal.weeklyTarget || 7);

      if (logsCount >= target) {
        // Increment Streak & Multiplier
        habit.stats.currentStreak += 1;
        // Increase multiplier by 0.1 every week of streak, max 2.0x
        habit.stats.multiplier = Math.min(1 + (habit.stats.currentStreak * 0.1), 2.0);

        if (habit.stats.currentStreak > habit.stats.bestStreak) {
          habit.stats.bestStreak = habit.stats.currentStreak;
        }
      } else {
        // Reset Streak
        habit.stats.currentStreak = 0;
        habit.stats.multiplier = 1.0;
      }
      await habit.save();
    }
  }

  /**
   * 4. CRUD OPERATIONS
   */
  async createHabit(userId: string, data: any) {
    return await Habit.create({ userId, ...data });
  }

  async updateHabit(userId: string, habitId: string, data: any) {
    return await Habit.findOneAndUpdate({ _id: habitId, userId }, data, { new: true });
  }

  async archiveHabit(userId: string, habitId: string) {
    return await Habit.findOneAndUpdate({ _id: habitId, userId }, { isArchived: true }, { new: true });
  }
  async deleteHabit(userId: string, habitId: string) {
    // 1. Remove all logs associated with this habit for this user
    await Log.deleteMany({ habitId, userId });

    // 2. Remove the habit template itself
    const deletedHabit = await Habit.findOneAndDelete({ _id: habitId, userId });

    if (!deletedHabit) {
      throw new Error("Habit not found or you are not authorized to delete it");
    }

    return deletedHabit;
  }
}