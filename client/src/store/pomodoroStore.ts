import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
};

interface PomodoroState {
  phase: PomodoroPhase;
  isRunning: boolean;
  remainingSeconds: number;
  /** Absolute wall-clock timestamp (ms) the current running phase ends at. Null when paused. */
  endsAt: number | null;
  cycleCount: number;
  linkedTaskId: string | null;
  settings: PomodoroSettings;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  skip: () => void;
  setLinkedTask: (taskId: string | null) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

function phaseDurationSeconds(phase: PomodoroPhase, settings: PomodoroSettings): number {
  if (phase === 'focus') return settings.focusMinutes * 60;
  if (phase === 'shortBreak') return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function nextPhase(phase: PomodoroPhase, cycleCount: number, settings: PomodoroSettings): PomodoroPhase {
  if (phase !== 'focus') return 'focus';
  return cycleCount % settings.longBreakEvery === 0 ? 'longBreak' : 'shortBreak';
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      phase: 'focus',
      isRunning: false,
      remainingSeconds: phaseDurationSeconds('focus', DEFAULT_POMODORO_SETTINGS),
      endsAt: null,
      cycleCount: 0,
      linkedTaskId: null,
      settings: DEFAULT_POMODORO_SETTINGS,

      start: () => {
        const { isRunning, remainingSeconds } = get();
        if (isRunning || remainingSeconds <= 0) return;
        set({ isRunning: true, endsAt: Date.now() + remainingSeconds * 1000 });
      },

      pause: () => {
        const { isRunning, endsAt } = get();
        if (!isRunning || endsAt === null) return;
        const remainingSeconds = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
        set({ isRunning: false, endsAt: null, remainingSeconds });
      },

      reset: () => {
        const { phase, settings } = get();
        set({ isRunning: false, endsAt: null, remainingSeconds: phaseDurationSeconds(phase, settings) });
      },

      skip: () => {
        const { phase, cycleCount, settings } = get();
        const newCycleCount = phase === 'focus' ? cycleCount + 1 : cycleCount;
        const upcoming = nextPhase(phase, newCycleCount, settings);

        set({
          phase: upcoming,
          cycleCount: newCycleCount,
          isRunning: false,
          endsAt: null,
          remainingSeconds: phaseDurationSeconds(upcoming, settings),
        });
      },

      tick: () => {
        const { isRunning, endsAt, phase, cycleCount, settings } = get();
        if (!isRunning || endsAt === null) return;

        const remainingSeconds = Math.max(0, Math.round((endsAt - Date.now()) / 1000));

        if (remainingSeconds > 0) {
          set({ remainingSeconds });
          return;
        }

        const newCycleCount = phase === 'focus' ? cycleCount + 1 : cycleCount;
        const upcoming = nextPhase(phase, newCycleCount, settings);

        set({
          phase: upcoming,
          cycleCount: newCycleCount,
          isRunning: false,
          endsAt: null,
          remainingSeconds: phaseDurationSeconds(upcoming, settings),
        });
      },

      setLinkedTask: (taskId) => set({ linkedTaskId: taskId }),

      updateSettings: (partial) => {
        const settings = { ...get().settings, ...partial };
        const { isRunning, phase } = get();
        set({
          settings,
          ...(isRunning ? {} : { remainingSeconds: phaseDurationSeconds(phase, settings) }),
        });
      },
    }),
    { name: 'pomodoro-storage' }
  )
);
