import Task from '../models/Task';
import Board from '../models/Board';
import { CreateTaskPayload, UpdateTaskPayload } from '../schemas/task.schema';

class TaskService {
  async createTask(userId: string, boardId: string, data: CreateTaskPayload) {
    const { dueDate, activeStartTime, targetDuration, ...rest } = data;

    const task = await Task.create({
      ...rest,
      user: userId,
      boardId,
      // Ensure targetDuration has a fallback to prevent NaN in frontend
      targetDuration: targetDuration || 7200000, 
      dueDate: dueDate ? new Date(dueDate) : undefined,
      activeStartTime: activeStartTime ? new Date(activeStartTime) : undefined,
    });

    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: task._id }
    });

    return task;
  }

  async getTasksByUser(userId: string) {
    return await Task.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getTasksByBoard(boardId: string) {
    return await Task.find({ boardId }).sort({ createdAt: -1 });
  }

  async updateTask(taskId: string, userId: string, updateData: UpdateTaskPayload) {
    const currentTask = await Task.findOne({ _id: taskId, user: userId });
    if (!currentTask) return null;

    const oldStatus = currentTask.status;
    const newStatus = updateData.status || oldStatus; // Fallback to current if not changing
    
    // --- TIMER LOGIC ---
    // Specifically destructure to IGNORE any manual time fields from the payload
    // and only use the allowed text/status fields.
    const { totalTimeSpent, activeStartTime, ...safeUpdateData } = updateData as any;
    let finalUpdate: any = { ...safeUpdateData };

    // Convert dueDate string to Date object if present
    if (safeUpdateData.dueDate !== undefined) {
      finalUpdate.dueDate = safeUpdateData.dueDate ? new Date(safeUpdateData.dueDate) : null;
    }

    // Case 1: START/RESUME (Moving TO inprogress)
    if (newStatus === 'inprogress' && oldStatus !== 'inprogress') {
      finalUpdate.activeStartTime = new Date();
    } 
    
    // Case 2: PAUSE/FINISH (Moving FROM inprogress)
    else if (oldStatus === 'inprogress' && (newStatus !== 'inprogress')) {
      const startTime = currentTask.activeStartTime 
        ? new Date(currentTask.activeStartTime).getTime() 
        : Date.now();
      const now = Date.now();
      
      const sessionDuration = Math.max(0, now - startTime); // Guaranteed positive
      
      finalUpdate.totalTimeSpent = (currentTask.totalTimeSpent || 0) + sessionDuration;
      finalUpdate.activeStartTime = null; 
    }

    // Case 3: UPDATING TEXT WHILE RUNNING (inprogress -> inprogress)
    // We EXPLICITLY ensure activeStartTime is not nullified if it's already there
    else if (newStatus === 'inprogress' && oldStatus === 'inprogress') {
       // Keep original timer running by not adding activeStartTime to $set
       delete finalUpdate.activeStartTime; 
    }
    
    // Case 4: Moving FROM todo to done etc (not inprogress)
    // No changes needed to activeStartTime or totalTimeSpent.

    return await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: finalUpdate }, 
      { new: true }
    );
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (task && task.boardId) {
      await Board.findByIdAndUpdate(task.boardId, { $pull: { tasks: taskId } });
    }
    return task;
  }
}

const taskServiceInstance = new TaskService();
export default taskServiceInstance;