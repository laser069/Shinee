export type FrequencyType = 'fixed' | 'flexible';

export interface DayEntry {
    completed: boolean;
    syncedAt?: string;
}

export interface WeeklyLog {
    _id: string;
    habitId: string;
    weekStartDate: string;
    days: Record<number, DayEntry>; // Keys 0-6
    stats: {
        timesCompleted: number;
        isGoalMet: boolean;
        bonusAchieved: boolean;
    };
}

export interface Habit {
    _id: string;
    name: string;
    color: string;
    frequencyType: FrequencyType;
    fixedDays: number[];
    goalCount: number;
    dailyStreak: number;
    longestStreak: number;
    multiplier: number;
    totalPoints: number;
    lastCompletedDate?: string;
    isActive: boolean;
}

export interface DashboardItem {
    habit: Habit;
    currentLog: WeeklyLog;
}

export interface CreateHabitPayload {
  name: string;
  frequencyType: 'flexible' | 'fixed';
  goalCount: number;
  fixedDays?: number[]; // Make optional
  color?: string;       // Make optional
}

export type HabitCategory = 'Health' | 'Work' | 'Personal' | 'Finance' | 'Other';