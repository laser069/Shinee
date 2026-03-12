import Task from '../models/Task';
import Board from '../models/Board';
import { CreateTaskPayload, UpdateTaskPayload } from '../schemas/task.schema';

class TaskService {
  async createTask(userId: string, boardId: string, data: CreateTaskPayload) {
    const { dueDate, targetDuration, ...rest } = data;

    const task = await Task.create({
      ...rest,
      user: userId,
      boardId,
      targetDuration: targetDuration ?? undefined, 
      dueDate: dueDate ? new Date(dueDate) : undefined,
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

 // Inside your Backend TaskService.ts
async updateTask(taskId: string, userId: string, updateData: UpdateTaskPayload) {
  const currentTask = await Task.findOne({ _id: taskId, user: userId });
  if (!currentTask) return null;

  // We spread the updateData first to capture the new targetDuration
  let finalUpdate: any = { ...updateData };

  const oldStatus = currentTask.status;
  const newStatus = updateData.status || oldStatus;

  // Timer logic...
  if (newStatus === 'inprogress' && oldStatus !== 'inprogress') {
    finalUpdate.activeStartTime = new Date();
  } else if (oldStatus === 'inprogress' && newStatus !== 'inprogress') {
    const startTime = new Date(currentTask.activeStartTime!).getTime();
    const sessionDuration = Date.now() - startTime;
    finalUpdate.totalTimeSpent = (currentTask.totalTimeSpent || 0) + sessionDuration;
    finalUpdate.activeStartTime = null;
  }

  // CRITICAL: Ensure we use the value from the DB if it wasn't provided in this specific update request
  // This prevents the field from being wiped out during simple drag-and-drops
  if (updateData.targetDuration === undefined) {
    finalUpdate.targetDuration = currentTask.targetDuration;
  }

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