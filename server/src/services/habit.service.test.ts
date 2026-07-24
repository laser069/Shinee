import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import habitService from './habit.service';
import { Habit } from '../models/Habit';

async function makeHabit(overrides: Partial<Record<string, any>> = {}) {
  return Habit.create({
    user: new mongoose.Types.ObjectId(),
    name: 'Drink water',
    frequencyType: 'flexible',
    goalCount: 3,
    ...overrides,
  });
}

describe('habit.service toggleDay streak/multiplier/points math', () => {
  it('starts a daily streak at 1 and awards base points on first completion', async () => {
    const habit = await makeHabit();
    const log = await habitService.ensureWeeklyLog(habit._id.toString());

    const updated = await habitService.toggleDay(log._id.toString(), 0, true);

    const refreshed = await Habit.findById(habit._id);
    expect(refreshed!.dailyStreak).toBe(1);
    expect(refreshed!.multiplier).toBe(1);
    expect(refreshed!.totalPoints).toBe(10);
    expect(updated.stats.timesCompleted).toBe(1);
  });

  it('increments streak day-over-day and applies +10% multiplier every 7 days', async () => {
    const habit = await makeHabit();

    // Simulate completing 6 days in a row already (streak = 6, multiplier = 1.0)
    await Habit.findByIdAndUpdate(habit._id, {
      dailyStreak: 6,
      lastCompletedDate: dayjs().subtract(1, 'day').startOf('day').toDate(),
    });

    const log = await habitService.ensureWeeklyLog(habit._id.toString());
    await habitService.toggleDay(log._id.toString(), 1, true);

    const refreshed = await Habit.findById(habit._id);
    expect(refreshed!.dailyStreak).toBe(7);
    expect(refreshed!.multiplier).toBe(1.1);
    expect(refreshed!.totalPoints).toBe(11); // round(10 * 1.1)
  });

  it('resets streak to 1 when more than a day has been missed', async () => {
    const habit = await makeHabit();
    await Habit.findByIdAndUpdate(habit._id, {
      dailyStreak: 5,
      longestStreak: 5,
      lastCompletedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const log = await habitService.ensureWeeklyLog(habit._id.toString());
    await habitService.toggleDay(log._id.toString(), 2, true);

    const refreshed = await Habit.findById(habit._id);
    expect(refreshed!.dailyStreak).toBe(1);
    expect(refreshed!.multiplier).toBe(1);
  });

  it('reverts streak and points when a day is uncompleted', async () => {
    const habit = await makeHabit();
    const log = await habitService.ensureWeeklyLog(habit._id.toString());

    await habitService.toggleDay(log._id.toString(), 0, true);
    let refreshed = await Habit.findById(habit._id);
    expect(refreshed!.totalPoints).toBe(10);

    await habitService.toggleDay(log._id.toString(), 0, false);
    refreshed = await Habit.findById(habit._id);
    expect(refreshed!.dailyStreak).toBe(0);
    expect(refreshed!.totalPoints).toBe(0);
  });

  it('marks the goal met once timesCompleted reaches goalCount for flexible habits', async () => {
    const habit = await makeHabit({ goalCount: 2 });
    const log = await habitService.ensureWeeklyLog(habit._id.toString());

    await habitService.toggleDay(log._id.toString(), 0, true);
    const updated = await habitService.toggleDay(log._id.toString(), 1, true);

    expect(updated.stats.isGoalMet).toBe(true);
  });

  it('marks the goal met only when all fixedDays are completed for fixed habits', async () => {
    const habit = await makeHabit({ frequencyType: 'fixed', fixedDays: [0, 2] });
    const log = await habitService.ensureWeeklyLog(habit._id.toString());

    let updated = await habitService.toggleDay(log._id.toString(), 0, true);
    expect(updated.stats.isGoalMet).toBe(false);

    updated = await habitService.toggleDay(log._id.toString(), 2, true);
    expect(updated.stats.isGoalMet).toBe(true);
  });
});
