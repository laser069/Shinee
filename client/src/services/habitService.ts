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
    scheduledDays?: number[]; // [1, 2, 3, 4, 5] for Mon-Fri
  };
  gamification?: {
    basePoints: number;
  };
}

export interface ToggleDayPayload {
  habitId: string;
  date: string;
}

const HABIT_ENDPOINTS = {
  BASE: '/habits',
  TOGGLE: '/habits/toggle',
  BY_ID: (id: string) => `/habits/${id}`,
};

export const getHabitsDashboard = async (): Promise<Habit[]> => {
  const response = await apiClient.get<{ success: boolean, data: Habit[] }>(HABIT_ENDPOINTS.BASE);
  return response.data.data;
};

export const createHabit = async (payload: CreateHabitPayload): Promise<Habit> => {
  const response = await apiClient.post<{ success: boolean, data: Habit }>(HABIT_ENDPOINTS.BASE, payload);
  return response.data.data;
};

export const toggleDay = async (payload: ToggleDayPayload): Promise<{ status: string }> => {
  const response = await apiClient.post<{ success: boolean, data: { status: string } }>(HABIT_ENDPOINTS.TOGGLE, payload);
  return response.data.data;
};

export const deleteHabit = async (id: string): Promise<void> => {
  await apiClient.delete(HABIT_ENDPOINTS.BY_ID(id));
};

const habitService = {
  getHabitsDashboard,
  createHabit,
  toggleDay,
  deleteHabit
};

export default habitService;
