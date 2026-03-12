export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

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
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  targetDuration?: number;
  // Note: We don't usually include activeStartTime here because 
  // the Service handles that automatically based on status changes.
}