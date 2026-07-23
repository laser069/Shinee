import apiClient from '../lib/apiClient';
import type { ApiResponse, StatsOverview } from '../types';

const statsService = {
  // Matches backend: GET /api/stats/overview
  getOverview: async (weeks = 8): Promise<StatsOverview> => {
    const { data } = await apiClient.get<ApiResponse<StatsOverview>>('/stats/overview', {
      params: { weeks },
    });
    return data.data;
  },
};

export default statsService;
