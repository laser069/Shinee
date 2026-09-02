import apiClient from '../lib/apiClient';
import type { ApiResponse } from '../types';

export type ImportMode = 'merge' | 'replace';

export interface ImportSummary {
  boards: number;
  tasks: number;
  habits: number;
  weeklyLogs: number;
}

const dataService = {
  /**
   * Downloads the current user's full backup (boards, tasks, habits, weekly logs)
   * as a JSON file via a Blob + anchor click.
   */
  exportData: async (): Promise<void> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>('/data/export');
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shinee-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },

  /**
   * Reads a previously exported JSON file and imports it under the current user.
   */
  importData: async (file: File, mode: ImportMode): Promise<ImportSummary> => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const { data } = await apiClient.post<ApiResponse<ImportSummary>>('/data/import', {
      ...parsed,
      mode,
    });
    return data.data;
  },
};

export default dataService;
