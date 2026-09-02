import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import dataService from './data.service';
import Board from '../models/Board';
import Task from '../models/Task';
import { Habit } from '../models/Habit';
import { WeeklyLog } from '../models/WeeklyLog';

describe('data.service export/import round-trip', () => {
  it("exports a user's full data and imports it under a new user with remapped ids intact", async () => {
    const originalUserId = new mongoose.Types.ObjectId().toString();
    const board = await Board.create({ title: 'Board A', user: originalUserId });
    const task = await Task.create({
      title: 'Task A',
      user: originalUserId,
      boardId: board._id,
      subtasks: [{ title: 'Sub 1' }],
    });
    await Board.findByIdAndUpdate(board._id, { $push: { tasks: task._id } });

    const habit = await Habit.create({ user: originalUserId, name: 'Read', goalCount: 3, totalPoints: 20 });
    await WeeklyLog.create({
      habitId: habit._id,
      weekStartDate: new Date('2026-01-05'),
      days: {
        0: { completed: true }, 1: { completed: false }, 2: { completed: false },
        3: { completed: false }, 4: { completed: false }, 5: { completed: false }, 6: { completed: false },
      },
      stats: { timesCompleted: 1, isGoalMet: false, bonusAchieved: false },
    });

    const exported = await dataService.exportAll(originalUserId);
    expect(exported.boards).toHaveLength(1);
    expect(exported.tasks).toHaveLength(1);
    expect(exported.habits).toHaveLength(1);
    expect(exported.weeklyLogs).toHaveLength(1);

    const newUserId = new mongoose.Types.ObjectId().toString();
    const result = await dataService.importAll(newUserId, { ...exported, mode: 'merge' } as any);

    expect(result).toEqual({ boards: 1, tasks: 1, habits: 1, weeklyLogs: 1 });

    const newBoards = await Board.find({ user: newUserId });
    const newTasks = await Task.find({ user: newUserId });
    const newHabits = await Habit.find({ user: newUserId });
    const newLogs = await WeeklyLog.find({ habitId: newHabits[0]!._id });

    expect(newBoards[0]!._id.toString()).not.toBe(board._id.toString());
    expect(newTasks[0]!.boardId.toString()).toBe(newBoards[0]!._id.toString());
    expect(newBoards[0]!.tasks.map(String)).toContain(newTasks[0]!._id.toString());
    expect(newTasks[0]!.subtasks[0]!.title).toBe('Sub 1');
    expect(newLogs).toHaveLength(1);
    expect(newLogs[0]!.stats.timesCompleted).toBe(1);

    // Original user's data is untouched by the import.
    expect(await Board.findById(board._id)).not.toBeNull();
  });

  it("replace mode wipes the target user's existing data before importing", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    await Board.create({ title: 'Stale board', user: userId });

    const emptyExport = { version: 1, boards: [], tasks: [], habits: [], weeklyLogs: [] };
    await dataService.importAll(userId, { ...emptyExport, mode: 'replace' } as any);

    expect(await Board.find({ user: userId })).toHaveLength(0);
  });

  it('drops tasks and weekly logs whose parent board/habit was not part of the import', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      version: 1,
      mode: 'merge' as const,
      boards: [],
      tasks: [{
        _id: new mongoose.Types.ObjectId().toString(),
        boardId: new mongoose.Types.ObjectId().toString(),
        title: 'Orphan task',
        status: 'todo' as const,
        totalTimeSpent: 0,
        tags: [],
        subtasks: [],
      }],
      habits: [],
      weeklyLogs: [{
        habitId: new mongoose.Types.ObjectId().toString(),
        weekStartDate: new Date(),
        days: {},
        stats: { timesCompleted: 0, isGoalMet: false, bonusAchieved: false },
      }],
    };

    const result = await dataService.importAll(userId, payload as any);

    expect(result).toEqual({ boards: 0, tasks: 0, habits: 0, weeklyLogs: 0 });
  });
});
