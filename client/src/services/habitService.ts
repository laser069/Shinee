import apiClient from '../lib/apiClient';
import type { Habit, DashboardItem, CreateHabitPayload, ApiResponse } from '../types';

const habitService = {
  // Matches backend: .get(getDashboard) on router.route("/")
  getHabitsDashboard: async (): Promise<DashboardItem[]> => {
    const { data } = await apiClient.get<ApiResponse<DashboardItem[]>>('/habits');
    return data.data;
  },

  // Matches backend: .post(createHabit) on router.route("/")
createHabit: async (payload: CreateHabitPayload): Promise<Habit> => {
    // Clean the payload
    const cleanPayload = { ...payload };
    if (cleanPayload.frequencyType === 'flexible') {
      delete cleanPayload.fixedDays;
    } else if (cleanPayload.frequencyType === 'fixed' && cleanPayload.fixedDays) {
      cleanPayload.goalCount = cleanPayload.fixedDays.length;
    }

    const { data } = await apiClient.post<ApiResponse<Habit>>('/habits', cleanPayload);
    return data.data;
  },

  // Matches backend: .patch(updateHabit) on router.route("/:id")
  updateHabit: async (id: string, payload: Partial<CreateHabitPayload>): Promise<Habit> => {
    const { data } = await apiClient.patch<ApiResponse<Habit>>(`/habits/${id}`, payload);
    return data.data;
  },

  // Matches backend: router.post("/toggle", toggleActivity)
  // Note: Backend logic requires habitId and dayIndex (or date) in the body
  toggleDay: async (habitId: string, dayIndex: number): Promise<void> => {
    await apiClient.post('/habits/toggle', { habitId, dayIndex });
  },

  // Matches backend: .delete(deleteHabit) on router.route("/:id")
  deleteHabit: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  // Matches backend: router.patch("/:id/archive", archiveHabit)
  archiveHabit: async (id: string): Promise<void> => {
    await apiClient.patch(`/habits/${id}/archive`);
  }
};

export default habitService;