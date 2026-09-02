import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePomodoroStore, DEFAULT_POMODORO_SETTINGS } from './pomodoroStore';

function resetStore() {
  usePomodoroStore.setState({
    phase: 'focus',
    isRunning: false,
    remainingSeconds: DEFAULT_POMODORO_SETTINGS.focusMinutes * 60,
    endsAt: null,
    cycleCount: 0,
    linkedTaskId: null,
    settings: DEFAULT_POMODORO_SETTINGS,
  });
}

beforeEach(() => {
  resetStore();
  vi.useRealTimers();
});

describe('pomodoroStore', () => {
  it('starts a focus phase and sets a wall-clock end time', () => {
    usePomodoroStore.getState().start();
    const state = usePomodoroStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.endsAt).not.toBeNull();
  });

  it('pause snapshots the remaining seconds and clears endsAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    usePomodoroStore.getState().start();

    vi.advanceTimersByTime(10_000);
    usePomodoroStore.getState().pause();

    const state = usePomodoroStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.endsAt).toBeNull();
    expect(state.remainingSeconds).toBe(DEFAULT_POMODORO_SETTINGS.focusMinutes * 60 - 10);
    vi.useRealTimers();
  });

  it('reset restores the full duration for the current phase', () => {
    usePomodoroStore.setState({ remainingSeconds: 5, isRunning: true, endsAt: Date.now() + 5000 });
    usePomodoroStore.getState().reset();

    const state = usePomodoroStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.remainingSeconds).toBe(DEFAULT_POMODORO_SETTINGS.focusMinutes * 60);
  });

  it('tick transitions focus -> shortBreak once time runs out, incrementing cycleCount', () => {
    usePomodoroStore.setState({ isRunning: true, endsAt: Date.now() - 1000, phase: 'focus', cycleCount: 0 });
    usePomodoroStore.getState().tick();

    const state = usePomodoroStore.getState();
    expect(state.phase).toBe('shortBreak');
    expect(state.cycleCount).toBe(1);
    expect(state.isRunning).toBe(false);
    expect(state.remainingSeconds).toBe(DEFAULT_POMODORO_SETTINGS.shortBreakMinutes * 60);
  });

  it('routes to a longBreak every `longBreakEvery` focus cycles', () => {
    usePomodoroStore.setState({
      isRunning: true,
      endsAt: Date.now() - 1000,
      phase: 'focus',
      cycleCount: DEFAULT_POMODORO_SETTINGS.longBreakEvery - 1,
    });
    usePomodoroStore.getState().tick();

    expect(usePomodoroStore.getState().phase).toBe('longBreak');
  });

  it('skip from a break always returns to focus without counting a cycle', () => {
    usePomodoroStore.setState({ phase: 'shortBreak', cycleCount: 2 });
    usePomodoroStore.getState().skip();

    const state = usePomodoroStore.getState();
    expect(state.phase).toBe('focus');
    expect(state.cycleCount).toBe(2);
  });

  it('updateSettings recalculates remainingSeconds only while paused', () => {
    usePomodoroStore.getState().updateSettings({ focusMinutes: 50 });
    expect(usePomodoroStore.getState().remainingSeconds).toBe(50 * 60);

    usePomodoroStore.setState({ isRunning: true, endsAt: Date.now() + 60_000 });
    usePomodoroStore.getState().updateSettings({ focusMinutes: 10 });
    // Running phases keep their live countdown; only the settings value changes.
    expect(usePomodoroStore.getState().remainingSeconds).not.toBe(10 * 60);
  });
});
