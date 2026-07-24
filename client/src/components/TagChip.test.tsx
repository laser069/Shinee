import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagChip } from './TagChip';

const tag = { name: 'Urgent', color: '#f43f5e' };

describe('TagChip', () => {
  it('renders the tag name', () => {
    render(<TagChip tag={tag} />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('calls onClick when clicked and marked interactive', async () => {
    const onClick = vi.fn();
    render(<TagChip tag={tag} onClick={onClick} />);

    await userEvent.click(screen.getByText('Urgent'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onRemove without triggering onClick', async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<TagChip tag={tag} onClick={onClick} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('dims the chip when active is explicitly false', () => {
    const { container } = render(<TagChip tag={tag} active={false} />);
    expect(container.firstChild).toHaveClass('opacity-40');
  });
});
