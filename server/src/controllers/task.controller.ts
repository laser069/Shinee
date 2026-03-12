import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import taskService from '../services/task.service';
import { UpdateTaskPayload } from '../schemas/task.schema';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { boardId, ...taskData } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ success: false, message: "Board ID is required" });
    }

    // Default time values are set by the Mongoose Schema, so we just pass text/status
    const task = await taskService.createTask(req.user.id, boardId, taskData);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { boardId } = req.query;
    let tasks;

    if (boardId && typeof boardId === 'string') {
      tasks = await taskService.getTasksByBoard(boardId);
    } else {
      tasks = await taskService.getTasksByUser(req.user.id);
    }
    
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const taskId = req.params.id as string;
    
    /**
     * SECURITY NOTE: 
     * We extract the update data, but we should be careful. 
     * If a user tries to send 'totalTimeSpent' in the body, they could skip work.
     * The Service handles the time math, so we just pass what they are allowed to change.
     */
    const updateData: UpdateTaskPayload = req.body;

    // Pass to service: service handles the oldStatus vs newStatus logic
    const task = await taskService.updateTask(taskId, req.user.id, updateData);
    
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const taskId = req.params.id as string;
    const task = await taskService.deleteTask(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};