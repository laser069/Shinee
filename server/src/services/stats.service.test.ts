import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import statsService from './stats.service';
import Task from '../models/Task';
import Board from '../models/Board';
import { Habit } from '../models/Habit';

describe('stats.service.getTaskStats', () => {
  it('aggregates counts by status, overdue tasks, and time spent', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await Board.create({ title: 'Board', user: userId });

    await Task.create({
      title: 'Overdue',
      user: userId,
      boardId: board._id,
      status: 'todo',
      dueDate: dayjs().subtract(2, 'day').toDate(),
      totalTimeSpent: 1000,
    });
    await Task.create({
      title: 'Done today',
      user: userId,
      boardId: board._id,
      status: 'done',
      totalTimeSpent: 2000,
    });
    await Task.create({
      title: 'In progress',
      user: userId,
      boardId: board._id,
      status: 'inprogress',
      totalTimeSpent: 500,
    });

    const stats = await statsService.getTaskStats(userId.toString());

    expect(stats.total).toBe(3);
    expect(stats.byStatus).toEqual({ todo: 1, inprogress: 1, done: 1 });
    expect(stats.overdueCount).toBe(1);
    expect(stats.totalTimeSpent).toBe(3500);
    expect(stats.avgTimeSpent).toBe(Math.round(3500 / 3));

    const today = dayjs().format('YYYY-MM-DD');
    const todayBucket = stats.completedLast7Days.find(d => d.date === today);
    expect(todayBucket?.count).toBe(1);
  });

  it('does not count a done task past its due date as overdue', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await Board.create({ title: 'Board', user: userId });
    await Task.create({
      title: 'Completed late',
      user: userId,
      boardId: board._id,
      status: 'done',
      dueDate: dayjs().subtract(5, 'day').toDate(),
    });

    const stats = await statsService.getTaskStats(userId.toString());
    expect(stats.overdueCount).toBe(0);
  });
});

describe('stats.service.getHabitStats', () => {
  it('summarizes totals across a user\'s active habits', async () => {
    const userId = new mongoose.Types.ObjectId();
    await Habit.create({
      user: userId,
      name: 'Read',
      goalCount: 3,
      totalPoints: 30,
      dailyStreak: 4,
      longestStreak: 10,
      isActive: true,
    });
    await Habit.create({
      user: userId,
      name: 'Archived habit',
      totalPoints: 999,
      isActive: false,
    });

    const stats = await statsService.getHabitStats(userId.toString(), 4);

    expect(stats.totalHabits).toBe(1);
    expect(stats.totalPoints).toBe(30);
    expect(stats.avgDailyStreak).toBe(4);
    expect(stats.longestStreakOverall).toBe(10);
    expect(stats.weeklyTrend).toHaveLength(4);
  });
});
