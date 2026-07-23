export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export const TAG_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#a855f7'] as const;

export interface Tag {
  name: string;
  color: string;
}

export interface Recurrence {
  type: 'daily' | 'weekly';
  interval: number;
}

export interface Task {
  _id: string;
  boardId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;

  // --- Time Tracking Fields ---
  dueDate?: string | null;           // The hard deadline
  totalTimeSpent: number;            // Accumulated ms (The "Bank")
  activeStartTime?: string | null;   // ISO string of current session start
  targetDuration: number;            // The goal in ms (e.g., 7200000 for 2h)
  tags: Tag[];
  recurrence?: Recurrence | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  boardId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  targetDuration?: number; // Optional: allow setting a custom goal on create
  tags?: Tag[];
  recurrence?: Recurrence | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  targetDuration?: number;
  tags?: Tag[];
  recurrence?: Recurrence | null;
  // Note: We don't usually include activeStartTime here because
  // the Service handles that automatically based on status changes.
}