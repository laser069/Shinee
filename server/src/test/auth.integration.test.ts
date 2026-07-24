import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('auth + task flow', () => {
  it('registers, logs in, creates a board, and creates a task', async () => {
    const credentials = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'Password1' };

    const registerRes = await request(app).post('/api/users/register').send(credentials);
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.token).toBeTruthy();

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token as string;

    const boardRes = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Board' });
    expect(boardRes.status).toBe(201);
    const boardId = boardRes.body.data._id;

    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task', boardId });
    expect(taskRes.status).toBe(201);
    expect(taskRes.body.data.title).toBe('My Task');
    expect(taskRes.body.data.boardId).toBe(boardId);
  });

  it('rejects task creation without a token', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Nope', boardId: 'x' });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid task payload with a validation error', async () => {
    const credentials = { name: 'Bob', email: 'bob@example.com', password: 'Password1' };
    const registerRes = await request(app).post('/api/users/register').send(credentials);
    const token = registerRes.body.data.token as string;

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', boardId: 'someboard' });

    expect(res.status).toBe(400);
  });
});
