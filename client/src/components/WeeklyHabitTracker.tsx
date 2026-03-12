import React from 'react';
import { Check, Flame, MoreHorizontal } from 'lucide-react';
import type { DashboardItem } from '../types';

interface Props {
  items: DashboardItem[];
  onToggle: (id: string, dayIdx: number) => void;
  onEdit: (habit: any) => void; // Added for the pro-spreadsheet feel
}

const getTodayIndex = () => (new Date().getDay() + 6) % 7;

const HabitRow: React.FC<{
  item: DashboardItem;
  todayIdx: number;
  onToggle: (id: string, idx: number) => void;
  onEdit: (habit: any) => void;
}> = ({ item, todayIdx, onToggle, onEdit }) => {
  const { habit, currentLog } = item;
  
  return (
    <div className="group flex items-center border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
      
      {/* 1. Identity Column */}
      <div className="w-72 flex items-center gap-3 py-2 px-4 border-r border-slate-800/50">
        <span className="text-base grayscale group-hover:grayscale-0 transition-all">
          {habit.icon}
        </span>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[13px] font-medium text-slate-200 truncate leading-tight">
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Flame size={10} className="text-orange-500/70" />
              <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                {habit.dailyStreak}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Spreadsheet Grid */}
      <div className="flex-1 grid grid-cols-7 h-full">
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
          const isDone = currentLog.days[idx]?.completed;
          const isToday = idx === todayIdx;
          const isScheduled = habit.frequencyType === 'fixed' ? habit.fixedDays.includes(idx) : true;

          return (
            <div 
              key={idx} 
              className={`flex items-center justify-center border-r border-slate-800/30 last:border-r-0 py-2
                ${isToday ? 'bg-indigo-500/[0.03]' : ''}`}
            >
              <button
                disabled={!isScheduled}
                onClick={() => onToggle(habit._id, idx)}
                className={`
                  w-5 h-5 rounded-[4px] flex items-center justify-center transition-all
                  ${isDone 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : isScheduled 
                      ? 'border border-slate-700 hover:border-slate-500 bg-transparent' 
                      : 'opacity-5 cursor-not-allowed'
                  }
                  ${isToday && !isDone && isScheduled ? 'ring-1 ring-indigo-500 ring-inset' : ''}
                `}
              >
                {isDone && <Check size={12} strokeWidth={3} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Progress & Actions */}
      <div className="w-32 flex items-center justify-between px-4 border-l border-slate-800/50">
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-mono text-slate-400">
            {currentLog.stats.timesCompleted}/{habit.goalCount}
          </span>
          <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: `${Math.min((currentLog.stats.timesCompleted / (habit.goalCount || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
        <button 
          onClick={() => onEdit(habit)}
          className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
};

export const WeeklyHabitTracker: React.FC<Props & { onEdit: (h: any) => void }> = ({ items, onToggle, onEdit }) => {
  const todayIdx = getTodayIndex();
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="w-full border border-slate-800 rounded-sm overflow-hidden bg-[#0b0f1a]/40">
      
      {/* Table Header Row */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/40">
        <div className="w-72 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-800">
          Habit
        </div>
        <div className="flex-1 grid grid-cols-7">
          {labels.map((l, i) => (
            <div 
              key={i} 
              className={`py-2 text-center text-[10px] font-bold tracking-tighter border-r border-slate-800/50 last:border-r-0
                ${i === todayIdx ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-600'}`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="w-32 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-slate-800 text-right">
          Progress
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {items.map((item) => (
          <HabitRow 
            key={item.habit._id} 
            item={item} 
            todayIdx={todayIdx} 
            onToggle={onToggle} 
            onEdit={onEdit} 
          />
        ))}
      </div>
    </div>
  );
};