import Task from '../models/Task';

class NotificationService {
  async getUpcoming(userId: string, withinHours = 24) {
    const now = new Date();
    const horizon = new Date(now.getTime() + withinHours * 3600000);

    const tasks = await Task.find({
      user: userId,
      status: { $ne: 'done' },
      dueDate: { $ne: null, $lte: horizon },
    }).sort({ dueDate: 1 });

    return tasks.map(t => ({
      taskId: t._id,
      boardId: t.boardId,
      title: t.title,
      dueDate: t.dueDate,
      overdue: t.dueDate! < now,
    }));
  }
}

const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;
