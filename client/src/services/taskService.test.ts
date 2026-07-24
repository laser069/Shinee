import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../types';

vi.mock('../lib/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../lib/apiClient';
import taskService from './taskService';

const mockedApiClient = vi.mocked(apiClient, true);

const sampleTask: Task = {
  _id: 't1',
  boardId: 'b1',
  title: 'Sample',
  status: 'todo',
  priority: 'medium',
  totalTimeSpent: 0,
  targetDuration: 0,
  tags: [],
  subtasks: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('taskService', () => {
  it('getTasks unwraps data.data and forwards boardId as a query param', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: { success: true, data: [sampleTask] } });

    const result = await taskService.getTasks('b1');

    expect(mockedApiClient.get).toHaveBeenCalledWith('/tasks', { params: { boardId: 'b1' } });
    expect(result).toEqual([sampleTask]);
  });

  it('getTasks omits params when no boardId is given', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: { success: true, data: [] } });

    await taskService.getTasks();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/tasks', { params: {} });
  });

  it('createTask posts the payload and unwraps the created task', async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: { success: true, data: sampleTask } });

    const result = await taskService.createTask({ boardId: 'b1', title: 'Sample' });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/tasks', { boardId: 'b1', title: 'Sample' });
    expect(result).toEqual(sampleTask);
  });

  it('updateTask patches the task by id', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({ data: { success: true, data: sampleTask } });

    const result = await taskService.updateTask('t1', { status: 'done' });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/tasks/t1', { status: 'done' });
    expect(result).toEqual(sampleTask);
  });

  it('deleteTask falls back to a default message when the server omits one', async () => {
    mockedApiClient.delete.mockResolvedValueOnce({ data: { success: true } });

    const result = await taskService.deleteTask('t1');

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/tasks/t1');
    expect(result).toEqual({ message: 'Task deleted successfully' });
  });
});
