import React, { useMemo } from 'react';
import type { DashboardItem } from '../types';

const calculateStreak = (days: any) => {
  let streak = 0;
  const today = (new Date().getDay() + 6) % 7;
  
  // Count backwards from today
  for (let i = today; i >= 0; i--) {
    if (days[i]?.completed) {
      streak++;
    } else {
      break; 
    }
  }
  return streak;
};

const HabitRow: React.FC<{ item: DashboardItem; todayIdx: number; onToggle: (id: string, idx: number) => void }> = ({ item, todayIdx, onToggle }) => {
  const { habit, currentLog } = item;
  const streak = useMemo(() => calculateStreak(currentLog.days), [currentLog.days]);

  // ... (previous completion logic)

  return (
    <div className="group flex items-center py-6 px-4 hover:bg-white/[0.02] rounded-[2rem] transition-all duration-500">
      
      {/* 1. Identity & Metadata */}
      <div className="w-96 flex items-center gap-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-slate-100 tracking-tight leading-none">
            {habit.name}
          </h3>
          <div className="mt-2 flex items-center gap-4">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
              <span className="text-[10px]">🔥</span>
              <span className="text-xs font-black text-orange-400 tabular-nums">{streak}d streak</span>
            </div>
            <span className="text-sm font-medium text-slate-600">
              Target: {habit.goalCount}/wk
            </span>
          </div>
        </div>
      </div>

      {/* 2. Day Grid (Same as before) */}
      <div className="flex-1 flex justify-center gap-4 px-12">
        {/* ... mapping logic ... */}
      </div>

      {/* 3. Status (Same as before) */}
    </div>
  );
};