// Types for API responses

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Task status type
export type TaskStatus = 'todo' | 'inprogress' | 'done';

// Task interface
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user: string;
  boardId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Board interface
export interface Board {
  _id: string;
  title: string;
  user: string;
  tasks: string[]; // Array of task IDs, not full Task objects
  createdAt?: string;
  updatedAt?: string;
}
