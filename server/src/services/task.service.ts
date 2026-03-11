import Task from '../models/Task';
import Board from '../models/Board';
import { CreateTaskPayload } from '../schemas/task.schema';

class TaskService {
  async createTask(userId: string, boardId: string, data: CreateTaskPayload) {
    const task = await Task.create({
      ...data,
      user: userId,
      boardId,
    });

    // Automatically push the new task ID to the specified board
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

  async updateTask(taskId: string, userId: string, updateData: Partial<CreateTaskPayload>) {
    return await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (task) {
      // Clean up reference in any board
      await Board.updateMany({}, { $pull: { tasks: taskId } });
    }
    return task;
  }


}


export default new TaskService();