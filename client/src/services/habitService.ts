import apiClient from '../lib/apiClient';
import type { 
  Habit, 
  HabitLog, 
  HabitStats, 
  HabitCategory, 
  HabitTrackingType 
} from '../types/api';

export interface CreateHabitPayload {
  name: string;
  category: HabitCategory;
  trackingType: HabitTrackingType;
  goal: {
    targetValue: number;
    unit?: string;
    frequency: 'daily' | 'weekly';
  };
  gamification?: {
    basePoints: number;
  };
}

export interface LogActivityPayload {
  habitId: string;
  value: number;
  date?: string;
  note?: string;
}

const HABIT_ENDPOINTS = {
  BASE: '/habits',
  LOG: '/habits/log',
  RELAPSE: (id: string) => `/habits/${id}/relapse`,
  STATS: (id: string) => `/habits/${id}/stats`,
};

export const getHabitsDashboard = async (): Promise<Habit[]> => {
  const response = await apiClient.get<{ success: boolean, data: Habit[] }>(HABIT_ENDPOINTS.BASE);
  return response.data.data;
};

export const createHabit = async (payload: CreateHabitPayload): Promise<Habit> => {
  const response = await apiClient.post<{ success: boolean, data: Habit }>(HABIT_ENDPOINTS.BASE, payload);
  return response.data.data;
};

export const logActivity = async (payload: LogActivityPayload): Promise<HabitLog> => {
  const response = await apiClient.post<{ success: boolean, data: HabitLog }>(HABIT_ENDPOINTS.LOG, payload);
  return response.data.data;
};

export const handleRelapse = async (id: string): Promise<Habit> => {
  const response = await apiClient.patch<{ success: boolean, data: Habit }>(HABIT_ENDPOINTS.RELAPSE(id));
  return response.data.data;
};

export const getHabitStats = async (id: string): Promise<HabitStats> => {
  const response = await apiClient.get<{ success: boolean, data: HabitStats }>(HABIT_ENDPOINTS.STATS(id));
  return response.data.data;
};

const habitService = {
  getHabitsDashboard,
  createHabit,
  logActivity,
  handleRelapse,
  getHabitStats,
};

export default habitService;
