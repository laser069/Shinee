import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { usePomodoroStore } from '../store/pomodoroStore';
import taskService from '../services/taskService';
import type { Task } from '../types';

const PHASE_LABELS: Record<string, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Starts/stops the linked task's own timer (status inprogress/todo), reusing the
 * server's existing activeStartTime/totalTimeSpent accrual instead of a bespoke field. */
function syncLinkedTaskTimer(taskId: string | null, running: boolean) {
  if (!taskId) return;
  taskService.updateTask(taskId, { status: running ? 'inprogress' : 'todo' }).catch(() => {});
}

export const PomodoroWidget: React.FC = () => {
  const {
    phase,
    isRunning,
    remainingSeconds,
    linkedTaskId,
    start,
    pause,
    reset,
    skip,
    tick,
    setLinkedTask,
  } = usePomodoroStore();

  const [collapsed, setCollapsed] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (!isRunning) return;
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  useEffect(() => {
    taskService.getTasks().then(setTasks).catch(() => {});
  }, []);

  // Focus phase ended (naturally via tick, or via skip) — stop the linked task's clock.
  useEffect(() => {
    if (prevPhaseRef.current === 'focus' && phase !== 'focus') {
      syncLinkedTaskTimer(linkedTaskId, false);
    }
    prevPhaseRef.current = phase;
  }, [phase, linkedTaskId]);

  const handleStart = () => {
    start();
    if (phase === 'focus') syncLinkedTaskTimer(linkedTaskId, true);
  };

  const handlePause = () => {
    pause();
    if (phase === 'focus') syncLinkedTaskTimer(linkedTaskId, false);
  };

  const handleReset = () => {
    const wasRunningFocus = isRunning && phase === 'focus';
    reset();
    if (wasRunningFocus) syncLinkedTaskTimer(linkedTaskId, false);
  };

  const handleSkip = () => {
    const wasRunningFocus = isRunning && phase === 'focus';
    skip();
    if (wasRunningFocus) syncLinkedTaskTimer(linkedTaskId, false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] font-sans">
      <div className="bg-white border-4 border-[#0A0A0A] rounded-3xl shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] overflow-hidden w-72">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#0A0A0A] text-white"
        >
          <span className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
            <Timer className="w-4 h-4 text-[#F5C842]" />
            {PHASE_LABELS[phase]} · {formatTime(remainingSeconds)}
          </span>
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {!collapsed && (
          <div className="p-5 space-y-4">
            <div className="text-center text-5xl font-black text-[#0A0A0A] tracking-tighter">
              {formatTime(remainingSeconds)}
            </div>

            <div className="flex gap-2">
              {isRunning ? (
                <button type="button" onClick={handlePause} className="flex-1 p-3 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button type="button" onClick={handleStart} className="flex-1 p-3 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> Start
                </button>
              )}
              <button type="button" onClick={handleReset} className="p-3 bg-white border-4 border-[#0A0A0A] rounded-2xl hover:bg-[#F5C842]/20 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleSkip} className="p-3 bg-white border-4 border-[#0A0A0A] rounded-2xl hover:bg-[#F5C842]/20 transition-all">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#0A0A0A]/60 uppercase tracking-widest px-1">Link a task</label>
              <select
                value={linkedTaskId ?? ''}
                onChange={(e) => setLinkedTask(e.target.value || null)}
                className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-3 text-[#0A0A0A] outline-none font-bold text-sm cursor-pointer appearance-none"
              >
                <option value="">No task linked</option>
                {tasks.map(t => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
