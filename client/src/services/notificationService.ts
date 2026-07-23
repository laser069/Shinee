import apiClient from '../lib/apiClient';
import type { NotificationItem, ApiResponse } from '../types';

const notificationService = {
  getUpcoming: async (withinHours = 24): Promise<NotificationItem[]> => {
    const { data } = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications', {
      params: { withinHours },
    });
    return data.data;
  },
};

export default notificationService;
