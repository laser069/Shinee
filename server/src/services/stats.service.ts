import { Types } from 'mongoose';
import dayjs from 'dayjs';
import Task from '../models/Task';
import { Habit } from '../models/Habit';
import { WeeklyLog } from '../models/WeeklyLog';

class StatsService {
  private calculateMonday(date: dayjs.Dayjs): Date {
    const dayOfWeek = date.day();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return date.subtract(daysFromMonday, 'day').startOf('day').toDate();
  }

  async getTaskStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const tasks = await Task.find({ user: userObjectId });

    const byStatus = { todo: 0, inprogress: 0, done: 0 };
    let overdueCount = 0;
    let totalTimeSpent = 0;
    const now = dayjs();

    // Last 7 days, bucketed by day. `updatedAt` on a done task is used as a
    // completion-date proxy since Task has no dedicated completedAt field.
    const days = Array.from({ length: 7 }, (_, i) =>
      now.subtract(6 - i, 'day').format('YYYY-MM-DD')
    );
    const completedByDay: Record<string, number> = Object.fromEntries(days.map(d => [d, 0]));

    for (const task of tasks) {
      byStatus[task.status] += 1;
      totalTimeSpent += task.totalTimeSpent || 0;

      if (task.dueDate && task.status !== 'done' && dayjs(task.dueDate).isBefore(now)) {
        overdueCount += 1;
      }

      if (task.status === 'done') {
        const completedDay = dayjs(task.updatedAt).format('YYYY-MM-DD');
        if (completedByDay[completedDay] !== undefined) {
          completedByDay[completedDay] += 1;
        }
      }
    }

    return {
      total: tasks.length,
      byStatus,
      overdueCount,
      totalTimeSpent,
      avgTimeSpent: tasks.length > 0 ? Math.round(totalTimeSpent / tasks.length) : 0,
      completedLast7Days: days.map(date => ({ date, count: completedByDay[date] })),
    };
  }

  async getHabitStats(userId: string, weeks: number) {
    const userObjectId = new Types.ObjectId(userId);
    const habits = await Habit.find({ user: userObjectId, isActive: true });

    const totalPoints = habits.reduce((sum, h) => sum + (h.totalPoints || 0), 0);
    const avgDailyStreak = habits.length > 0
      ? Math.round(habits.reduce((sum, h) => sum + (h.dailyStreak || 0), 0) / habits.length)
      : 0;
    const longestStreakOverall = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

    const currentWeekStart = this.calculateMonday(dayjs());
    const habitIds = habits.map(h => h._id);

    const perHabitBreakdown = await Promise.all(
      habits.map(async (habit) => {
        const currentLog = await WeeklyLog.findOne({
          habitId: habit._id,
          weekStartDate: currentWeekStart,
        });
        const timesCompleted = currentLog?.stats.timesCompleted ?? 0;
        const completionRate = habit.goalCount > 0
          ? Math.min(100, Math.round((timesCompleted / habit.goalCount) * 100))
          : 0;

        return {
          id: (habit._id as Types.ObjectId).toString(),
          name: habit.name,
          color: habit.color,
          dailyStreak: habit.dailyStreak,
          totalPoints: habit.totalPoints,
          completionRate,
        };
      })
    );

    // Weekly trend across the last N weeks, aggregated from WeeklyLog.
    const weekStarts: Date[] = Array.from({ length: weeks }, (_, i) =>
      this.calculateMonday(dayjs().subtract(weeks - 1 - i, 'week'))
    );

    const logs = await WeeklyLog.find({
      habitId: { $in: habitIds },
      weekStartDate: { $in: weekStarts },
    });

    const weeklyTrend = weekStarts.map(weekStart => {
      const weekLogs = logs.filter(l => dayjs(l.weekStartDate).isSame(weekStart, 'day'));
      const timesCompleted = weekLogs.reduce((sum, l) => sum + (l.stats.timesCompleted || 0), 0);
      const goalsMet = weekLogs.filter(l => l.stats.isGoalMet).length;
      return {
        weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
        timesCompleted,
        goalsMet,
      };
    });

    return {
      totalHabits: habits.length,
      totalPoints,
      avgDailyStreak,
      longestStreakOverall,
      perHabitBreakdown,
      weeklyTrend,
    };
  }

  async getOverview(userId: string, weeks: number) {
    const [taskStats, habitStats] = await Promise.all([
      this.getTaskStats(userId),
      this.getHabitStats(userId, weeks),
    ]);

    return { taskStats, habitStats };
  }
}

export default new StatsService();
