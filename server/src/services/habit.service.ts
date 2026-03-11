import { Habit, Log } from "../models/Habit";
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

export class HabitService {
  /**
   * Generates the Weekly Table Data
   */
  async getWeeklySheet(userId: string) {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 });     // Sunday

    const habits = await Habit.find({ userId });
    const logs = await Log.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    const daysInWeek = eachDayOfInterval({ start, end });

    return habits.map(habit => {
      const grid = daysInWeek.map(dayDate => {
        const log = logs.find(l => 
          l.habitId.toString() === habit._id.toString() && 
          isSameDay(new Date(l.date), dayDate)
        );

        return {
          date: dayDate,
          isCompleted: !!log,
          isScheduled: habit.goal.scheduledDays.includes(dayDate.getDay())
        };
      });

      const completedCount = grid.filter(g => g.isCompleted).length;
      const totalScheduled = habit.goal.scheduledDays.length || 1;

      return {
        ...habit.toObject(),
        grid,
        weeklyProgress: Math.min(Math.round((completedCount / totalScheduled) * 100), 100)
      };
    });
  }

  async toggleDay(userId: string, habitId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) throw new Error("Habit not found");

    const existingLog = await Log.findOne({ userId, habitId, date: targetDate });

    if (existingLog) {
      await Log.deleteOne({ _id: existingLog._id });
      return { status: 'unchecked' };
    } else {
      await Log.create({
        userId,
        habitId,
        date: targetDate,
        value: habit.goal.targetValue,
        pointsEarned: habit.gamification.basePoints
      });
      return { status: 'checked' };
    }
  }

  async updateHabit(userId: string, habitId: string, data: any) {
    return await Habit.findOneAndUpdate({ _id: habitId, userId }, data, { new: true });
  }

  async deleteHabit(userId: string, habitId: string) {
    await Log.deleteMany({ habitId, userId });
    return await Habit.findOneAndDelete({ _id: habitId, userId });
  }
}