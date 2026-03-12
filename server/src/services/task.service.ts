import Task from '../models/Task';
import Board from '../models/Board';
import { CreateTaskPayload, UpdateTaskPayload } from '../schemas/task.schema';

class TaskService {
  /**
   * CREATE: Setup initial task and link to board
   */
  async createTask(userId: string, boardId: string, data: CreateTaskPayload) {
  // 1. Destructure to extract the fields that need conversion
  const { dueDate, activeStartTime, ...rest } = data;

  // 2. Convert strings/nulls to Date objects or undefined
  const task = await Task.create({
    ...rest,
    user: userId,
    boardId,
    // Convert ISO string to Date object; if null/undefined, pass undefined
    dueDate: dueDate ? new Date(dueDate) : undefined,
    activeStartTime: activeStartTime ? new Date(activeStartTime) : undefined,
  });

  await Board.findByIdAndUpdate(boardId, {
    $push: { tasks: task._id }
  });

  return task;
}

  /**
   * READ: Fetch all tasks for a specific user
   */
  async getTasksByUser(userId: string) {
    return await Task.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * READ: Fetch tasks for a specific board (Fixed the missing method)
   */
  async getTasksByBoard(boardId: string) {
    return await Task.find({ boardId }).sort({ createdAt: -1 });
  }

  /**
   * UPDATE: The core "Pause/Resume" engine
   */
  async updateTask(taskId: string, userId: string, updateData: UpdateTaskPayload) {
    const currentTask = await Task.findOne({ _id: taskId, user: userId });
    if (!currentTask) return null;

    const oldStatus = currentTask.status;
    const newStatus = updateData.status;
    let finalUpdate: any = { ...updateData };

    // Case 1: START/RESUME (Moving TO In Progress)
    if (newStatus === 'inprogress' && oldStatus !== 'inprogress') {
      finalUpdate.activeStartTime = new Date();
    } 
    
    // Case 2: PAUSE/FINISH (Moving FROM In Progress)
    else if (oldStatus === 'inprogress' && newStatus && newStatus !== 'inprogress') {
      const startTime = currentTask.activeStartTime 
        ? new Date(currentTask.activeStartTime).getTime() 
        : Date.now();
      const now = Date.now();
      
      const sessionDuration = now - startTime;
      
      finalUpdate.totalTimeSpent = (currentTask.totalTimeSpent || 0) + sessionDuration;
      finalUpdate.activeStartTime = null; // Clear the stopwatch
    }

    // Case 3: Maintenance update (Updating title while timer runs)
    if (newStatus === 'inprogress' && oldStatus === 'inprogress') {
       delete finalUpdate.activeStartTime; 
    }

    return await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: finalUpdate }, 
      { new: true }
    );
  }

  /**
   * DELETE: Remove task and unlink from board
   */
  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (task && task.boardId) {
      await Board.findByIdAndUpdate(task.boardId, { $pull: { tasks: taskId } });
    }
    return task;
  }
}

// Export the singleton instance
const taskServiceInstance = new TaskService();
export default taskServiceInstance;