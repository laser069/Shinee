import type { Task } from './task';

export interface Board {
  _id: string;
  title: string;
  user: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardPayload {
  title: string;
}

export interface UpdateBoardPayload {
  title: string;
}
