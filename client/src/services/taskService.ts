import apiClient, { type Task, type TaskStatus } from '../lib/apiClient';

// Types for request payloads
export interface CreateTaskPayload {
  title: string;
  description: string;
  status?: TaskStatus;
  boardId: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// API endpoints
const TASK_ENDPOINTS = {
  TASKS: '/tasks',
  TASK_DETAILS: (id: string) => `/tasks/${id}`,
} as const;

/**
 * Get all tasks for the authenticated user, optionally filtered by board
 * GET /api/tasks?boardId=...
 * Requires JWT token
 */
export const getTasks = async (boardId?: string): Promise<Task[]> => {
  const params = boardId ? { boardId } : {};
  const response = await apiClient.get<Task[]>(TASK_ENDPOINTS.TASKS, { params });
  return response.data;
};

/**
 * Get a specific task by ID
 * GET /api/tasks/:id
 * Requires JWT token
 */
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await apiClient.get<Task>(TASK_ENDPOINTS.TASK_DETAILS(id));
  return response.data;
};

/**
 * Create a new task
 * POST /api/tasks
 * Requires JWT token
 */
export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await apiClient.post<Task>(TASK_ENDPOINTS.TASKS, payload);
  return response.data;
};

/**
 * Update a task
 * PATCH /api/tasks/:id
 * Requires JWT token
 */
export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  const response = await apiClient.patch<Task>(TASK_ENDPOINTS.TASK_DETAILS(id), payload);
  return response.data;
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 * Requires JWT token
 */
export const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(TASK_ENDPOINTS.TASK_DETAILS(id));
  return response.data;
};

// Default export
const taskService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
