import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import app from '../app';
import Task from '../models/Task';
import { WeeklyLog } from '../models/WeeklyLog';

/**
 * Phase 0 regression suite: every behaviour the Flutter client depends on, plus
 * the ownership bugs a second client exposes.
 */

type Actor = { token: string; auth: (req: request.Test) => request.Test };

const register = async (email: string): Promise<Actor> => {
  const res = await request(app)
    .post('/api/users/register')
    .send({ name: 'Test User', email, password: 'Password1' });
  expect(res.status).toBe(201);
  const token = res.body.data.token as string;
  return { token, auth: (req) => req.set('Authorization', `Bearer ${token}`) };
};

const createBoard = async (actor: Actor, title = 'Board') => {
  const res = await actor.auth(request(app).post('/api/boards')).send({ title });
  expect(res.status).toBe(201);
  return res.body.data._id as string;
};

const createTask = async (actor: Actor, boardId: string, title = 'Task') => {
  const res = await actor.auth(request(app).post('/api/tasks')).send({ title, boardId });
  expect(res.status).toBe(201);
  return res.body.data._id as string;
};

/**
 * Serializes a local Monday the way a device does: the instant as UTC ISO plus
 * the offset needed to recover the device's wall clock. Derived from the host's
 * own zone so the test is timezone-independent.
 * (JS getTimezoneOffset() is minutes WEST of UTC; the API wants minutes east,
 * matching Dart's DateTime.timeZoneOffset.inMinutes - hence the negation.)
 */
const asDeviceWeekStart = (monday: dayjs.Dayjs) => ({
  weekStartDate: monday.toDate().toISOString(),
  tzOffsetMinutes: -monday.toDate().getTimezoneOffset()
});

const createHabit = async (
  actor: Actor,
  body: Record<string, unknown> = { name: 'Read', frequencyType: 'flexible', goalCount: 3 }
) => {
  const res = await actor.auth(request(app).post('/api/habits')).send(body);
  expect(res.status).toBe(201);
  return res.body.data._id as string;
};

describe('0.1 JSON 404 + global error handler', () => {
  it('returns JSON, not an HTML error page, for an unmatched route', async () => {
    const res = await request(app).get('/api/nope');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('/api/nope');
  });
});

describe('0.2 register cannot self-grant admin', () => {
  it('ignores a client-supplied isAdmin flag', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Mallory', email: 'mallory@example.com', password: 'Password1', isAdmin: true });

    expect(res.status).toBe(201);
    expect(res.body.data.user.isAdmin).toBe(false);

    const decoded = jwt.decode(res.body.data.token) as { isAdmin?: boolean };
    expect(decoded.isAdmin).toBe(false);
  });
});

describe('0.3 / E2 ownership', () => {
  it('does not leak another user\'s tasks through ?boardId=', async () => {
    const alice = await register('alice@example.com');
    const bob = await register('bob@example.com');

    const aliceBoard = await createBoard(alice, "Alice's board");
    await createTask(alice, aliceBoard, 'Secret');

    const res = await bob.auth(request(app).get(`/api/tasks?boardId=${aliceBoard}`));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('refuses to create a task inside a board the caller does not own', async () => {
    const alice = await register('alice2@example.com');
    const bob = await register('bob2@example.com');
    const aliceBoard = await createBoard(alice);

    const res = await bob.auth(request(app).post('/api/tasks'))
      .send({ title: 'Intruder', boardId: aliceBoard });

    expect(res.status).toBe(404);
    expect(await Task.countDocuments({ boardId: aliceBoard })).toBe(0);
  });

  it('deletes a board\'s tasks along with the board', async () => {
    const alice = await register('alice3@example.com');
    const boardId = await createBoard(alice);
    await createTask(alice, boardId, 'Doomed');

    const res = await alice.auth(request(app).delete(`/api/boards/${boardId}`));

    expect(res.status).toBe(200);
    expect(await Task.countDocuments({ boardId })).toBe(0);
  });
});

describe('0.4 / E1 date offsets and validation errors', () => {
  it('accepts a dueDate carrying a +05:30 offset', async () => {
    const alice = await register('alice4@example.com');
    const boardId = await createBoard(alice);

    const res = await alice.auth(request(app).post('/api/tasks'))
      .send({ title: 'Offset task', boardId, dueDate: '2026-09-01T10:00:00+05:30' });

    expect(res.status).toBe(201);
  });

  it('rejects a malformed dueDate with a populated errors array', async () => {
    const alice = await register('alice5@example.com');
    const boardId = await createBoard(alice);

    const res = await alice.auth(request(app).post('/api/tasks'))
      .send({ title: 'Bad date', boardId, dueDate: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // Locks the zod v4 `.issues` fix: this array used to serialize as undefined.
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('0.8 lean board list', () => {
  it('populates tasks by default and returns bare ids with ?populate=false', async () => {
    const alice = await register('alice6@example.com');
    const boardId = await createBoard(alice);
    await createTask(alice, boardId, 'Visible');

    const populated = await alice.auth(request(app).get('/api/boards'));
    expect(populated.status).toBe(200);
    expect(populated.body.data[0].tasks[0].title).toBe('Visible');

    const lean = await alice.auth(request(app).get('/api/boards?populate=false'));
    expect(lean.status).toBe(200);
    expect(typeof lean.body.data[0].tasks[0]).toBe('string');
  });
});

describe('0.9 GET /api/tasks/:id', () => {
  it('returns the caller\'s own task and 404s on someone else\'s', async () => {
    const alice = await register('alice7@example.com');
    const bob = await register('bob7@example.com');
    const boardId = await createBoard(alice);
    const taskId = await createTask(alice, boardId, 'Mine');

    const mine = await alice.auth(request(app).get(`/api/tasks/${taskId}`));
    expect(mine.status).toBe(200);
    expect(mine.body.data.title).toBe('Mine');

    const theirs = await bob.auth(request(app).get(`/api/tasks/${taskId}`));
    expect(theirs.status).toBe(404);
  });
});

describe('0.10 / 0.11 habit toggle', () => {
  it('rejects an out-of-range dayIndex', async () => {
    const alice = await register('alice8@example.com');
    const habitId = await createHabit(alice);

    const res = await alice.auth(request(app).post('/api/habits/toggle'))
      .send({ habitId, dayIndex: 9 });

    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('still accepts the web client\'s { habitId, dayIndex } body', async () => {
    const alice = await register('alice9@example.com');
    const habitId = await createHabit(alice);
    // Monday is always <= today within the current week, so this never trips
    // the future-date guard.
    const res = await alice.auth(request(app).post('/api/habits/toggle'))
      .send({ habitId, dayIndex: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.action).toBe('completed');
  });

  it('writes into the week named by weekStartDate, not the server\'s week', async () => {
    const alice = await register('alice10@example.com');
    const habitId = await createHabit(alice);

    // A Monday three weeks back, so it cannot collide with the current week.
    const pastMonday = dayjs().subtract(3, 'week').startOf('week').add(1, 'day').startOf('day');
    const { weekStartDate, tzOffsetMinutes } = asDeviceWeekStart(pastMonday);

    const res = await alice.auth(request(app).post('/api/habits/toggle'))
      .send({ habitId, dayIndex: 2, weekStartDate, tzOffsetMinutes });

    expect(res.status).toBe(200);

    // Creating a habit already seeds a log for the *current* week, so assert on
    // the past week's log specifically - that is what weekStartDate steered.
    const logs = await WeeklyLog.find({ habitId });
    const pastLog = logs.find(
      log => dayjs(log.weekStartDate).format('YYYY-MM-DD') === pastMonday.format('YYYY-MM-DD')
    );
    expect(pastLog, 'a log should exist for the requested week').toBeDefined();
    expect(pastLog!.days[2]?.completed).toBe(true);

    // ...and the current week must be untouched.
    const currentLog = logs.find(log => log !== pastLog);
    expect(currentLog?.stats.timesCompleted ?? 0).toBe(0);
  });

  it('rejects a future date', async () => {
    const alice = await register('alice11@example.com');
    const habitId = await createHabit(alice);
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const res = await alice.auth(request(app).post('/api/habits/toggle'))
      .send({ habitId, date: tomorrow });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });
});

describe('E3 fixedDays is Mon=0', () => {
  it('marks a Mon/Wed/Fri habit as goal-met after toggling days 0, 2 and 4', async () => {
    const alice = await register('alice12@example.com');
    const habitId = await createHabit(alice, {
      name: 'Gym',
      frequencyType: 'fixed',
      fixedDays: [0, 2, 4],
      goalCount: 3
    });

    // Anchor on a fully elapsed past week so no day is in the future.
    const pastMonday = dayjs().subtract(2, 'week').startOf('week').add(1, 'day').startOf('day');
    const { weekStartDate, tzOffsetMinutes } = asDeviceWeekStart(pastMonday);

    for (const dayIndex of [0, 2, 4]) {
      const res = await alice.auth(request(app).post('/api/habits/toggle'))
        .send({ habitId, dayIndex, weekStartDate, tzOffsetMinutes });
      expect(res.status).toBe(200);
    }

    const log = await WeeklyLog.findOne({ habitId, weekStartDate: pastMonday.toDate() });
    expect(log, 'a log should exist for the requested week').not.toBeNull();
    expect(log!.stats.isGoalMet).toBe(true);
    expect(log!.stats.timesCompleted).toBe(3);
  });
});
