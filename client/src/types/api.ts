// Types for API responses

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Task status type
export type TaskStatus = 'todo' | 'inprogress' | 'done';

// Task interface
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Board interface
export interface Board {
  _id: string;
  title: string;
  user: string;
  tasks: string[]; // Array of task IDs, not full Task objects
  createdAt?: string;
  updatedAt?: string;
}
// Habit types
export type HabitCategory = 'Health' | 'Growth' | 'Quit' | 'Social' | 'Milestone';
export type HabitTrackingType = 'numeric' | 'binary' | 'countdown';

export interface HabitGoal {
  type: 'boolean' | 'numeric';
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  scheduledDays: number[];
  weeklyTarget: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HabitGamification {
  basePoints: number;
  currentStreak: number;
  highestStreak: number;
  lastRelapseDate?: string;
  totalXP?: number;
  multiplier?: number;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  ui: {
    icon: string;
    color: string;
  };
  goal: HabitGoal;
  gamification: HabitGamification;
  createdAt: string;
  updatedAt: string;
  grid?: { date: string; isCompleted: boolean; isScheduled: boolean }[];
  weeklyProgress?: number;
}

export interface HabitLog {
  _id: string;
  habitId: string;
  userId: string;
  date: string;
  value: number;
  pointsEarned: number;
  multiplierAtTime: number;
  createdAt: string;
}

export interface HabitStats {
  daysSinceLastRelapse: number;
  currentStreak: number;
  highestStreak: number;
}
