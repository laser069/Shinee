import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import apiClient from '../lib/apiClient';
import dataService from './dataService';

const mockedApiClient = vi.mocked(apiClient, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('dataService.importData', () => {
  it('reads the file, attaches the chosen mode, and posts to /data/import', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { boards: 1, tasks: 2, habits: 0, weeklyLogs: 0 } },
    });

    const file = new File([JSON.stringify({ version: 1, boards: [] })], 'backup.json', {
      type: 'application/json',
    });

    const summary = await dataService.importData(file, 'merge');

    expect(mockedApiClient.post).toHaveBeenCalledWith('/data/import', { version: 1, boards: [], mode: 'merge' });
    expect(summary).toEqual({ boards: 1, tasks: 2, habits: 0, weeklyLogs: 0 });
  });
});
