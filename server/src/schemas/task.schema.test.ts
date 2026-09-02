import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskPayloadSchema } from './task.schema';

describe('task.schema subtasks', () => {
  it('accepts subtasks on create and defaults completed to false', () => {
    const parsed = CreateTaskSchema.parse({
      title: 'Ship feature',
      subtasks: [{ title: 'Write tests' }, { title: 'Open PR', completed: true }],
    });

    expect(parsed.subtasks).toEqual([
      { title: 'Write tests', completed: false },
      { title: 'Open PR', completed: true },
    ]);
  });

  it('defaults subtasks to an empty array when omitted', () => {
    const parsed = CreateTaskSchema.parse({ title: 'No checklist' });
    expect(parsed.subtasks).toEqual([]);
  });

  it('rejects a subtask with an empty title', () => {
    expect(() =>
      CreateTaskSchema.parse({ title: 'Bad checklist', subtasks: [{ title: '' }] })
    ).toThrow();
  });

  it('round-trips subtasks through the partial update schema', () => {
    const parsed = UpdateTaskPayloadSchema.parse({
      subtasks: [{ _id: '507f1f77bcf86cd799439011', title: 'Existing item', completed: true }],
    });

    expect(parsed.subtasks).toEqual([
      { _id: '507f1f77bcf86cd799439011', title: 'Existing item', completed: true },
    ]);
  });
});
