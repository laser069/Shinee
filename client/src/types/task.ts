export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  _id: string;
  boardId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  boardId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}