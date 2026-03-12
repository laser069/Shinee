import React from 'react';
import { Check, Flame } from 'lucide-react';
import type { DashboardItem, Habit } from '../types';

interface Props {
  items: DashboardItem[];
  onToggle: (id: string, dayIdx: number) => void;
}

// Helper: Monday-aligned index
const getTodayIndex = () => (new Date().getDay() + 6) % 7;

const HabitRow: React.FC<{
  item: DashboardItem;
  todayIdx: number;
  onToggle: (id: string, idx: number) => void;
}> = ({ item, todayIdx, onToggle }) => {
  const { habit, currentLog } = item;

  return (
    <div className="group flex items-center py-8 px-6 hover:bg-white/[0.02] rounded-[2.5rem] transition-all duration-300">
      
      {/* 1. Large Readable Identity */}
      <div className="w-[400px] flex items-center gap-8">
        <span className="text-5xl">{habit.icon}</span>
        <div className="flex flex-col gap-1">
          {/* Hero Text: Big & Clear */}
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {habit.name}
          </h3>
          
          {/* Subtext: Simple explanation */}
          <div className="flex items-center gap-5 mt-1">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Flame size={14} fill="currentColor" />
              <span className="text-sm font-bold">{habit.dailyStreak} day streak</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <span className="text-sm font-medium text-slate-500">
              Goal: {habit.goalCount} times this week
            </span>
          </div>
        </div>
      </div>

      {/* 2. Minimalist Grid (Small Checkboxes) */}
      <div className="flex-1 flex justify-center gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
          const isDone = currentLog.days[idx]?.completed;
          const isToday = idx === todayIdx;
          const isScheduled = habit.frequencyType === 'fixed' ? habit.fixedDays.includes(idx) : true;

          return (
            <button
              key={idx}
              disabled={!isScheduled}
              onClick={() => onToggle(habit._id, idx)}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                ${isDone 
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' 
                  : isScheduled 
                    ? 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800' 
                    : 'opacity-10 cursor-not-allowed'
                }
                ${isToday && !isDone && isScheduled ? 'border-indigo-500 border-2' : ''}
              `}
            >
              {isDone ? <Check size={18} strokeWidth={4} /> : null}
            </button>
          );
        })}
      </div>

      {/* 3. Growth Percentage */}
      <div className="w-24 text-right">
        <span className="text-3xl font-black text-slate-700 group-hover:text-indigo-400 transition-colors tabular-nums">
          {Math.round((currentLog.stats.timesCompleted / (habit.goalCount || 1)) * 100)}%
        </span>
      </div>
    </div>
  );
};

export const WeeklyHabitTracker: React.FC<Props> = ({ items, onToggle }) => {
  const todayIdx = getTodayIndex();
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="max-w-6xl mx-auto py-16">
      {/* Clean Headers */}
      <div className="flex items-center px-10 mb-6 opacity-40">
        <div className="w-[400px] text-xs font-black uppercase tracking-[0.3em] text-slate-400">Activity</div>
        <div className="flex-1 flex justify-center gap-3">
          {labels.map((l, i) => (
            <div key={i} className={`w-10 text-center text-xs font-black ${i === todayIdx ? 'text-indigo-500' : ''}`}>
              {l}
            </div>
          ))}
        </div>
        <div className="w-24 text-right text-xs font-black uppercase tracking-[0.3em] text-slate-400">Power</div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {items.map((item) => (
          <HabitRow key={item.habit._id} item={item} todayIdx={todayIdx} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
};