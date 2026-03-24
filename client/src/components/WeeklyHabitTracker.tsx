import React from 'react';
import { Check, Flame, MoreHorizontal, Trash2 } from 'lucide-react';
import type { DashboardItem } from '../types';

interface Props {
  items: DashboardItem[];
  onToggle: (id: string, dayIdx: number) => void;
  onEdit: (habit: any) => void;
  onDelete: (id: string) => void;
}

const getTodayIndex = () => (new Date().getDay() + 6) % 7;

const HabitRow: React.FC<{
  item: DashboardItem;
  todayIdx: number;
  onToggle: (id: string, idx: number) => void;
  onEdit: (habit: any) => void;
  onDelete: (id: string) => void;
}> = ({ item, todayIdx, onToggle, onEdit, onDelete }) => {
  const { habit, currentLog } = item;
  
  return (
    <div className="group flex items-center border-b-2 border-[#0A0A0A]/10 hover:bg-[#F5C842]/5 transition-colors">
      
      {/* 1. Identity Column */}
      <div className="w-72 flex items-center gap-3 py-4 px-6 border-r-2 border-[#0A0A0A]/10">
        <div className="flex flex-col min-w-0">
          <h3 className="text-[14px] font-black text-[#0A0A0A] truncate leading-tight uppercase">
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Flame size={10} className="text-[#F5C842]" />
              <span className="text-[10px] font-black text-[#0A0A0A]/40 tabular-nums uppercase">
                {habit.dailyStreak}d streak
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
              className={`flex items-center justify-center border-r-2 border-[#0A0A0A]/5 last:border-r-0 py-2
                ${isToday ? 'bg-[#F5C842]/5' : ''}`}
            >
              <button
                disabled={!isScheduled}
                onClick={() => onToggle(habit._id, idx)}
                className={`
                  w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2
                  ${isDone 
                    ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' 
                    : isScheduled 
                      ? 'border-[#0A0A0A]/20 hover:border-[#0A0A0A] bg-white' 
                      : 'opacity-0 cursor-not-allowed'
                  }
                  ${isToday && !isDone && isScheduled ? 'ring-2 ring-[#F5C842] ring-offset-1' : ''}
                `}
              >
                {isDone && <Check size={14} strokeWidth={4} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Progress & Actions */}
      <div className="w-40 flex items-center justify-between px-6 border-l-2 border-[#0A0A0A]/10">
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-black text-[#0A0A0A] tabular-nums">
            {currentLog.stats.timesCompleted}/{habit.goalCount}
          </span>
          <div className="w-16 h-2 bg-[#0A0A0A]/10 rounded-full mt-1 overflow-hidden border border-[#0A0A0A]/20">
            <div 
              className="h-full bg-[#F5C842]" 
              style={{ width: `${Math.min((currentLog.stats.timesCompleted / (habit.goalCount || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={() => onEdit(habit)}
            className="p-1 text-[#0A0A0A]/40 hover:text-[#0A0A0A]"
          >
            <MoreHorizontal size={16} />
          </button>
          <button 
            onClick={() => onDelete(habit._id)}
            className="p-1 text-[#0A0A0A]/40 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const WeeklyHabitTracker: React.FC<Props> = ({ items, onToggle, onEdit, onDelete }) => {
  const todayIdx = getTodayIndex();
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="w-full bg-white">
      
      {/* Table Header Row */}
      <div className="flex items-center border-b-2 border-[#0A0A0A] bg-[#0A0A0A]/5">
        <div className="w-72 px-6 py-3 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest border-r-2 border-[#0A0A0A]/10">
          Habit
        </div>
        <div className="flex-1 grid grid-cols-7">
          {labels.map((l, i) => (
            <div 
              key={i} 
              className={`py-3 text-center text-[10px] font-black tracking-widest border-r-2 border-[#0A0A0A]/5 last:border-r-0
                ${i === todayIdx ? 'text-[#0A0A0A] bg-[#F5C842]/20' : 'text-[#0A0A0A]/40'}`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="w-40 px-6 py-3 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest border-l-2 border-[#0A0A0A]/10 text-right">
          Weekly Goal
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
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};