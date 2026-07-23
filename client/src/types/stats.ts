export interface TaskStats {
  total: number;
  byStatus: {
    todo: number;
    inprogress: number;
    done: number;
  };
  overdueCount: number;
  totalTimeSpent: number;
  avgTimeSpent: number;
  completedLast7Days: { date: string; count: number }[];
}

export interface HabitBreakdownItem {
  id: string;
  name: string;
  color: string;
  dailyStreak: number;
  totalPoints: number;
  completionRate: number;
}

export interface HabitWeeklyTrendItem {
  weekStart: string;
  timesCompleted: number;
  goalsMet: number;
}

export interface HabitStats {
  totalHabits: number;
  totalPoints: number;
  avgDailyStreak: number;
  longestStreakOverall: number;
  perHabitBreakdown: HabitBreakdownItem[];
  weeklyTrend: HabitWeeklyTrendItem[];
}

export interface StatsOverview {
  taskStats: TaskStats;
  habitStats: HabitStats;
}
