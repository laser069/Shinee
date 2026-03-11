import apiClient from '../lib/apiClient';
import type { 
  Habit, 
  HabitCategory,
} from '../types/api';

export interface CreateHabitPayload {
  name: string;
  category: HabitCategory;
  ui: {
    icon: string;
    color: string;
  };
  goal: {
    type: 'boolean' | 'numeric';
    targetValue: number;
    unit: string;
    frequency: 'daily' | 'weekly';
    scheduledDays: number[];
    weeklyTarget: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface ToggleDayPayload {
  habitId: string;
  date: string;
}

const HABIT_ENDPOINTS = {
  BASE: '/habits',
  DASHBOARD: '/habits/dashboard',
  TOGGLE: '/habits/toggle',
  BY_ID: (id: string) => `/habits/${id}`,
};

export const getHabitsDashboard = async (): Promise<Habit[]> => {
  const response = await apiClient.get<{ success: boolean, data: Habit[] }>(HABIT_ENDPOINTS.DASHBOARD);
  return response.data.data;
};

export const createHabit = async (payload: CreateHabitPayload): Promise<Habit> => {
  const response = await apiClient.post<{ success: boolean, data: Habit }>(HABIT_ENDPOINTS.BASE, payload);
  return response.data.data;
};

export const updateHabit = async (id: string, payload: Partial<CreateHabitPayload>): Promise<Habit> => {
  const response = await apiClient.patch<{ success: boolean, data: Habit }>(HABIT_ENDPOINTS.BY_ID(id), payload);
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
  updateHabit,
  toggleDay,
  deleteHabit
};

export default habitService;
