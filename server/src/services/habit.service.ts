import { Types } from 'mongoose';
import { Habit, IHabit } from '../models/Habit';
import { WeeklyLog, IWeeklyLog } from '../models/WeeklyLog';
import { CreateHabitPayload } from '../schemas/habit.schema';
import dayjs from 'dayjs';

class HabitService {
  private calculateMonday(date: dayjs.Dayjs): Date {
    const dayOfWeek = date.day();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return date.subtract(daysFromMonday, 'day').startOf('day').toDate();
  }

  private getStartOfWeek(): Date {
    return this.calculateMonday(dayjs());
  }


  async createHabit(userId: string, data: CreateHabitPayload): Promise<IHabit> {
    const habit = await Habit.create({
      ...data,
      user: new Types.ObjectId(userId),
    });

    await this.ensureWeeklyLog(habit._id.toString());
    return habit as IHabit;
  }

  async getWeeklyDashboard(userId: string) {
    const habits = await Habit.find({ user: userId, isActive: true });
    const weekStart = this.getStartOfWeek();

    return await Promise.all(
      habits.map(async (habit) => {
        const habitId = (habit._id as Types.ObjectId).toString();

        let log = await WeeklyLog.findOne({
          habitId: habit._id,
          weekStartDate: weekStart,
        }) as IWeeklyLog;

        if (!log) {
          log = await this.ensureWeeklyLog(habitId);
        }

        return { habit, currentLog: log };
      })
    );
  }

  async syncStreaks(userId: string) {
    // Basic implementation: find all active habits for the user and check if streaks need reset
    const habits = await Habit.find({ user: userId, isActive: true });
    const today = dayjs().startOf('day');

    for (const habit of habits) {
      if (habit.lastCompletedDate) {
        const lastDate = dayjs(habit.lastCompletedDate);
        if (today.diff(lastDate, 'day') > 1) {
          // Streak broken
          habit.dailyStreak = 0;
          await habit.save();
        }
      }
    }
  }

  async toggleActivity(userId: string, data: { habitId: string; date: string; value?: number; note?: string; mood?: string }) {
    const { habitId, date, value } = data;
    
    // Find the habit to ensure it belongs to the user
    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) throw new Error("Habit not found");

    const dateObj = dayjs(date);
    const weekStart = this.calculateMonday(dateObj); // Monday start
    const dayIndex = (dateObj.day() + 6) % 7; // Convert Sun=0, Mon=1 to Mon=0, Sun=6

    let log: any = await WeeklyLog.findOne({ habitId, weekStartDate: weekStart });
    if (!log) {
      log = await this.ensureWeeklyLog(habitId, weekStart);
    }

    if (!log) throw new Error("Failed to find or create log for this week");

    // Toggle based on current state or provided value
    const isCompleted = value === undefined ? !(log.days[dayIndex]?.completed ?? false) : value > 0;
    
    const updatedLog = await this.toggleDay(log._id.toString(), dayIndex, isCompleted);
    
    return {
      action: isCompleted ? "completed" : "uncompleted",
      log: updatedLog
    };
  }

  async toggleDay(logId: string, dayIndex: number, completed: boolean) {
    const log = await WeeklyLog.findById(logId);
    if (!log) throw new Error("Log not found");

    const habit = await Habit.findById(log.habitId);
    if (!habit) throw new Error("Habit not found");

    const dayKey = `days.${dayIndex}.completed`;
    const syncKey = `days.${dayIndex}.syncedAt`;

    const updatedLog = await WeeklyLog.findByIdAndUpdate(
      logId,
      {
        $set: {
          [dayKey]: completed,
          [syncKey]: new Date()
        }
      },
      { new: true, runValidators: true }
    ) as IWeeklyLog | null;

    if (!updatedLog) throw new Error("Failed to update log");

    // --- FIXING THE UNDEFINED ERROR ---
    const daysArray = Object.values(updatedLog.days);
    const timesCompleted = daysArray.filter(d => d.completed).length;

    let isGoalMet = false;
    if (habit.frequencyType === 'fixed') {
      // Use optional chaining and nullish coalescing to ensure boolean
      isGoalMet = habit.fixedDays.every(dayIdx =>
        !!updatedLog.days[dayIdx]?.completed
      );
    } else {
      isGoalMet = timesCompleted >= habit.goalCount;
    }

    // Update the sub-document stats
    updatedLog.stats.timesCompleted = timesCompleted;
    updatedLog.stats.isGoalMet = isGoalMet;
    updatedLog.stats.bonusAchieved = isGoalMet && timesCompleted > habit.goalCount;

    await updatedLog.save();

    if (completed) {
      await this.updateStreaksAndMultiplier(habit);
    } else {
      await this.revertStreaksAndPoints(habit);
    }

    return updatedLog;
  }

  private async revertStreaksAndPoints(habit: IHabit) {
    const basePoints = 10;
    const earnedPoints = Math.round(basePoints * habit.multiplier);
    
    // Remove the points earned for this completion
    habit.totalPoints = Math.max(0, (habit.totalPoints || 0) - earnedPoints);
    
    // Reset daily streak when uncompleted
    habit.dailyStreak = 0;
    
    // Recalculate multiplier based on new streak
    const multiplierBonus = Math.floor(habit.dailyStreak / 7) * 0.1;
    habit.multiplier = Number((1 + multiplierBonus).toFixed(2));
    
    await habit.save();
  }

  private async updateStreaksAndMultiplier(habit: IHabit) {
    const today = dayjs().startOf('day');
    const lastDate = habit.lastCompletedDate ? dayjs(habit.lastCompletedDate) : null;

    // Daily Streak Logic
    if (lastDate && today.diff(lastDate, 'day') === 0) {
      // Already completed today, do nothing
    } else if (lastDate && today.diff(lastDate, 'day') === 1) {
      habit.dailyStreak += 1;
    } else if (!lastDate || today.diff(lastDate, 'day') > 1) {
      // If it's been more than 1 day, the streak resets
      habit.dailyStreak = 1;
    }

    // Multiplier: +10% bonus for every 7 days of streak
    const multiplierBonus = Math.floor(habit.dailyStreak / 7) * 0.1;
    habit.multiplier = Number((1 + multiplierBonus).toFixed(2));

    habit.lastCompletedDate = today.toDate();
    if (habit.dailyStreak > habit.longestStreak) {
      habit.longestStreak = habit.dailyStreak;
    }

    // Points Logic: 10 points * multiplier
    const basePoints = 10;
    const earnedPoints = Math.round(basePoints * habit.multiplier);
    habit.totalPoints = (habit.totalPoints || 0) + earnedPoints;

    await habit.save();
  }

  async ensureWeeklyLog(habitId: string, weekStart?: Date): Promise<IWeeklyLog> {
    const targetWeekStart = weekStart || this.getStartOfWeek();

    const existing = await WeeklyLog.findOne({
      habitId: new Types.ObjectId(habitId),
      weekStartDate: targetWeekStart
    });

    if (existing) return existing as IWeeklyLog;

    const newLog = await WeeklyLog.create({
      habitId: new Types.ObjectId(habitId),
      weekStartDate: targetWeekStart,
      days: {
        0: { completed: false }, 1: { completed: false }, 2: { completed: false },
        3: { completed: false }, 4: { completed: false }, 5: { completed: false },
        6: { completed: false }
      },
      stats: { timesCompleted: 0, isGoalMet: false, bonusAchieved: false }
    });

    return newLog as IWeeklyLog;
  }

  // Add this to your HabitService class

  async updateHabit(userId: string, habitId: string, updates: Partial<CreateHabitPayload>) {
    // 1. Update the Habit Template
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!habit) throw new Error("Habit not found or unauthorized");

    // 2. Sync the current WeeklyLog stats
    // If the user changed the goalCount or frequencyType, we must update the current week's status
    const weekStart = this.getStartOfWeek();
    const currentLog = await WeeklyLog.findOne({ habitId, weekStartDate: weekStart });

    if (currentLog) {
      const daysArray = Object.values(currentLog.days);
      const timesCompleted = daysArray.filter(d => d.completed).length;

      let isGoalMet = false;
      if (habit.frequencyType === 'fixed') {
        isGoalMet = habit.fixedDays.every(dayIdx => !!currentLog.days[dayIdx]?.completed);
      } else {
        isGoalMet = timesCompleted >= habit.goalCount;
      }

      currentLog.stats.timesCompleted = timesCompleted;
      currentLog.stats.isGoalMet = isGoalMet;
      await currentLog.save();
    }

    return habit;
  }

  async archiveHabit(userId: string, habitId: string) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, user: userId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!habit) throw new Error("Habit not found or unauthorized");
    return habit;
  }

  async deleteHabit(userId: string, habitId: string) {
    const habit = await Habit.findOneAndDelete({ _id: habitId, user: userId });
    if (!habit) throw new Error("Habit not found or unauthorized");

    // Also delete all logs associated with this habit
    await WeeklyLog.deleteMany({ habitId: habit._id });
    return habit;
  }
}

export default new HabitService();