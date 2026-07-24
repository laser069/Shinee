import mongoose from 'mongoose';
import Board from '../models/Board';
import Task from '../models/Task';
import { Habit } from '../models/Habit';
import { WeeklyLog } from '../models/WeeklyLog';
import type { ImportPayload } from '../schemas/data.schema';

class DataService {
  async exportAll(userId: string) {
    const [boards, tasks, habits] = await Promise.all([
      Board.find({ user: userId }).lean(),
      Task.find({ user: userId }).lean(),
      Habit.find({ user: userId }).lean(),
    ]);

    const habitIds = habits.map(h => h._id);
    const weeklyLogs = await WeeklyLog.find({ habitId: { $in: habitIds } }).lean();

    // Normalize ObjectId/Date instances to plain strings, matching the shape the
    // schema validates on import (and what actually crosses the wire as JSON).
    return JSON.parse(JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      boards,
      tasks,
      habits,
      weeklyLogs,
    }));
  }

  async importAll(userId: string, payload: ImportPayload) {
    const { mode, boards, tasks, habits, weeklyLogs } = payload;

    if (mode === 'replace') {
      const existingHabits = await Habit.find({ user: userId }).select('_id');
      await WeeklyLog.deleteMany({ habitId: { $in: existingHabits.map(h => h._id) } });
      await Habit.deleteMany({ user: userId });
      await Task.deleteMany({ user: userId });
      await Board.deleteMany({ user: userId });
    }

    // Boards first (empty tasks array; re-linked once new task ids exist).
    const boardIdMap = new Map<string, mongoose.Types.ObjectId>();
    const createdBoards = boards.length
      ? await Board.insertMany(boards.map(b => ({ title: b.title, user: userId, tasks: [] })))
      : [];
    boards.forEach((b, i) => boardIdMap.set(b._id, createdBoards[i]!._id as mongoose.Types.ObjectId));

    // Tasks, remapped onto the new boards. Drop any task whose board wasn't in the export.
    const taskIdMap = new Map<string, mongoose.Types.ObjectId>();
    const validTasks = tasks.filter(t => boardIdMap.has(t.boardId));
    const createdTasks = validTasks.length
      ? await Task.insertMany(validTasks.map(t => ({
          title: t.title,
          description: t.description,
          status: t.status,
          user: userId,
          boardId: boardIdMap.get(t.boardId),
          dueDate: t.dueDate ?? undefined,
          totalTimeSpent: t.totalTimeSpent,
          activeStartTime: t.activeStartTime ?? null,
          targetDuration: t.targetDuration ?? undefined,
          tags: t.tags,
          subtasks: t.subtasks,
        })))
      : [];
    validTasks.forEach((t, i) => taskIdMap.set(t._id, createdTasks[i]!._id as mongoose.Types.ObjectId));

    // Re-link each board's tasks array now that new task ids exist.
    for (const board of boards) {
      const newBoardId = boardIdMap.get(board._id);
      const newTaskIds = board.tasks
        .map(oldTaskId => taskIdMap.get(oldTaskId))
        .filter((id): id is mongoose.Types.ObjectId => !!id);
      if (newBoardId && newTaskIds.length) {
        await Board.findByIdAndUpdate(newBoardId, { $set: { tasks: newTaskIds } });
      }
    }

    const habitIdMap = new Map<string, mongoose.Types.ObjectId>();
    const createdHabits = habits.length
      ? await Habit.insertMany(habits.map(h => ({
          user: userId,
          name: h.name,
          color: h.color,
          frequencyType: h.frequencyType,
          fixedDays: h.fixedDays,
          goalCount: h.goalCount,
          dailyStreak: h.dailyStreak,
          weeklyStreak: h.weeklyStreak,
          longestStreak: h.longestStreak,
          lastCompletedDate: h.lastCompletedDate ?? undefined,
          multiplier: h.multiplier,
          totalPoints: h.totalPoints,
          isActive: h.isActive,
        })))
      : [];
    habits.forEach((h, i) => habitIdMap.set(h._id, createdHabits[i]!._id as mongoose.Types.ObjectId));

    const validLogs = weeklyLogs.filter(l => habitIdMap.has(l.habitId));
    if (validLogs.length) {
      await WeeklyLog.insertMany(validLogs.map(l => ({
        habitId: habitIdMap.get(l.habitId),
        weekStartDate: l.weekStartDate,
        days: l.days,
        stats: l.stats,
      })));
    }

    return {
      boards: createdBoards.length,
      tasks: createdTasks.length,
      habits: createdHabits.length,
      weeklyLogs: validLogs.length,
    };
  }
}

export default new DataService();
