import { Habit, Log } from "../models/Habit";
import type { IHabit } from "../models/Habit";
import { HabitInput, LogInput } from "../schemas/habit.schema";

export class HabitService {
  /**
   * Create a new Habit definition
   */
  async createHabit(userId: string, data: HabitInput) {
    return await Habit.create({
      userId,
      ...data,
      gamification: {
        currentStreak: 0,
        highestStreak: 0,
        basePoints: data.gamification?.basePoints ?? 10,
        lastRelapseDate: new Date(),
      }
    });
  }

  /**
   * Log activity for a habit and calculate rewards
   */
  async logActivity(userId: string, logData: LogInput) {
    const { habitId, value } = logData;

    // 1. Fetch Habit and cast to IHabit to fix ts(18049)
    const habit = await Habit.findOne({ _id: habitId, userId }) as IHabit | null;
    
    if (!habit) throw new Error("Habit not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. STREAK LOGIC (Only for Daily habits)
    if (habit.goal.frequency === 'daily' && habit.category !== 'Social') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const previousLog = await Log.findOne({ habitId, userId, date: yesterday });

      if (previousLog && previousLog.value >= habit.goal.targetValue) {
        habit.gamification.currentStreak += 1;
      } else {
        habit.gamification.currentStreak = 1;
      }

      if (habit.gamification.currentStreak > habit.gamification.highestStreak) {
        habit.gamification.highestStreak = habit.gamification.currentStreak;
      }
    }

    // 3. MULTIPLIER CALCULATION
    let multiplier = 1.0;
    const streak = habit.gamification.currentStreak;
    if (streak >= 15) multiplier = 3.0;
    else if (streak >= 8) multiplier = 2.0;
    else if (streak >= 4) multiplier = 1.5;

    // 4. POINTS CALCULATION 
    // Uses targetValue safely now because Zod ensures it's > 0
    const completionRatio = Math.min(value / habit.goal.targetValue, 1);
    const pointsAwarded = Math.round(
      completionRatio * habit.gamification.basePoints * multiplier
    );

    // 5. UPSERT LOG
    const log = await Log.findOneAndUpdate(
      { habitId, userId, date: today },
      { 
        value, 
        pointsEarned: pointsAwarded, 
        multiplierAtTime: multiplier 
      },
      { upsert: true, new: true }
    );

    // 6. PERSIST CHANGES
    await habit.save();

    return { log, habit, pointsAwarded };
  }

  /**
   * For 'Quit' category: Logic based on days passed since lastRelapseDate
   */
  async getQuitStats(userId: string, habitId: string) {
    const habit = await Habit.findOne({ _id: habitId, userId, category: 'Quit' }) as IHabit | null;
    if (!habit) throw new Error("Habit not found");

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - habit.gamification.lastRelapseDate.getTime());
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return { daysSince, habit };
  }

  /**
   * Reset 'Quit' habit
   */
  async handleRelapse(userId: string, habitId: string) {
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId, category: 'Quit' },
      { 
        "gamification.currentStreak": 0,
        "gamification.lastRelapseDate": new Date() 
      },
      { new: true }
    );
    return habit;
  }
}