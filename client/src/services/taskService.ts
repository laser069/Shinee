import apiClient from '../lib/apiClient';
import type { 
  Task, 
  CreateTaskPayload, 
  UpdateTaskPayload, 
  ApiResponse 
} from '../types';

/**
 * Service for Task-related API operations
 */
const taskService = {
  /**
   * Get all tasks, optionally filtered by boardId
   * GET /api/tasks?boardId=...
   */
  getTasks: async (boardId?: string): Promise<Task[]> => {
    const params = boardId ? { boardId } : {};
    const { data } = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return data.data;
  },

  /**
   * Get a specific task by ID
   */
  getTaskById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },

  /**
   * Create a new task
   */
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return data.data;
  },

  /**
   * Update task details or status (e.g., Drag & Drop move).
   * If the update completes a recurring task, the server also returns the
   * newly materialized next instance as `recurredTask`.
   */
  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<{ task: Task; recurredTask?: Task }> => {
    const { data } = await apiClient.patch<ApiResponse<Task> & { recurredTask?: Task }>(`/tasks/${id}`, payload);
    return { task: data.data, recurredTask: data.recurredTask };
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return { message: data.message || 'Task deleted successfully' };
  },
};

export default taskService;