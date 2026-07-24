import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import taskService from './task.service';
import Task from '../models/Task';
import Board from '../models/Board';

async function makeBoard(userId: mongoose.Types.ObjectId) {
  return Board.create({ title: 'Test board', user: userId });
}

describe('task.service', () => {
  it('createTask pushes the new task onto the parent board', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);

    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Write tests',
    } as any);

    const refreshedBoard = await Board.findById(board._id);
    expect(refreshedBoard!.tasks.map(String)).toContain(task._id.toString());
  });

  it('starts the timer when status moves into inprogress', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);
    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Focus task',
    } as any);

    const updated = await taskService.updateTask(task._id.toString(), userId.toString(), {
      status: 'inprogress',
    } as any);

    expect(updated!.activeStartTime).toBeTruthy();
  });

  it('accumulates totalTimeSpent when status moves out of inprogress', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);
    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Focus task',
    } as any);

    await taskService.updateTask(task._id.toString(), userId.toString(), {
      status: 'inprogress',
    } as any);

    // Backdate activeStartTime so we get a deterministic, non-zero session duration.
    await Task.findByIdAndUpdate(task._id, { activeStartTime: new Date(Date.now() - 5000) });

    const stopped = await taskService.updateTask(task._id.toString(), userId.toString(), {
      status: 'todo',
    } as any);

    expect(stopped!.activeStartTime).toBeNull();
    expect(stopped!.totalTimeSpent).toBeGreaterThanOrEqual(5000);
  });

  it('preserves targetDuration on updates that omit it (drag-and-drop safe)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);
    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Timed task',
      targetDuration: 60000,
    } as any);

    const moved = await taskService.updateTask(task._id.toString(), userId.toString(), {
      status: 'inprogress',
    } as any);

    expect(moved!.targetDuration).toBe(60000);
  });

  it('updateTask returns null for a task owned by a different user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);
    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Private task',
    } as any);

    const result = await taskService.updateTask(task._id.toString(), otherUserId.toString(), {
      title: 'Hijacked',
    } as any);

    expect(result).toBeNull();
  });

  it('deleteTask pulls the task off its board', async () => {
    const userId = new mongoose.Types.ObjectId();
    const board = await makeBoard(userId);
    const task = await taskService.createTask(userId.toString(), board._id.toString(), {
      title: 'Ephemeral',
    } as any);

    await taskService.deleteTask(task._id.toString(), userId.toString());

    const refreshedBoard = await Board.findById(board._id);
    expect(refreshedBoard!.tasks.map(String)).not.toContain(task._id.toString());
    expect(await Task.findById(task._id)).toBeNull();
  });
});
