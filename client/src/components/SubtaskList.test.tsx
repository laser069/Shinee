import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubtaskList } from './SubtaskList';
import type { Subtask } from '../types';

describe('SubtaskList', () => {
  it('adds a new subtask on Enter and clears the input', async () => {
    const onChange = vi.fn();
    render(<SubtaskList subtasks={[]} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Add a subtask');
    await userEvent.type(input, 'Write tests{Enter}');

    expect(onChange).toHaveBeenCalledWith([{ title: 'Write tests', completed: false }]);
  });

  it('shows a done/total progress count and toggles completion', async () => {
    const subtasks: Subtask[] = [
      { _id: '1', title: 'A', completed: true },
      { _id: '2', title: 'B', completed: false },
    ];
    const onChange = vi.fn();
    render(<SubtaskList subtasks={subtasks} onChange={onChange} />);

    expect(screen.getByText(/Subtasks/)).toHaveTextContent('Subtasks (1/2)');

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    expect(onChange).toHaveBeenCalledWith([
      { _id: '1', title: 'A', completed: true },
      { _id: '2', title: 'B', completed: true },
    ]);
  });

  it('removes a subtask', async () => {
    const subtasks: Subtask[] = [{ _id: '1', title: 'A', completed: false }];
    const onChange = vi.fn();
    render(<SubtaskList subtasks={subtasks} onChange={onChange} />);

    const removeButtons = screen.getAllByRole('button').filter(b => b.textContent === '');
    await userEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
