import React from 'react';
import { Flame, Target, Award, CheckCircle2 } from 'lucide-react';
import type { DashboardItem } from '../types';

interface HabitsDashboardProps {
  items: DashboardItem[];
}

export const HabitsDashboard: React.FC<HabitsDashboardProps> = ({ items }) => {
  const totalPoints = items.reduce((acc, item) => acc + (item.habit.totalPoints || 0), 0);
  const totalDailyStreak = items.reduce((acc, item) => acc + (item.habit.dailyStreak || 0), 0);
  
  const averageProgress = items.length > 0 
    ? (items.reduce((acc, item) => {
        const progress = (item.currentLog.stats.timesCompleted / item.habit.goalCount);
        return acc + Math.min(progress, 1);
      }, 0) / items.length) * 100 
    : 0;

  const completedToday = items.filter(item => {
    const todayIdx = (new Date().getDay() + 6) % 7;
    return item.currentLog.days[todayIdx]?.completed;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-800 rounded-sm bg-[#0b0f1a]/20 divide-x divide-slate-800">
      
      {/* Average Completion */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Target size={12} className="text-indigo-400" />
          Completion
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-slate-200">{Math.round(averageProgress)}%</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden max-w-[40px]">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Count */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Flame size={12} className="text-orange-500" />
          Total Streak
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-slate-200">{totalDailyStreak}</span>
          <span className="text-[10px] text-slate-600 font-medium">days</span>
        </div>
      </div>

      {/* Experience Points */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Award size={12} className="text-emerald-500" />
          Discipline
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-slate-200">{totalPoints.toLocaleString()}</span>
          <span className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">XP</span>
        </div>
      </div>

      {/* Daily Status */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <CheckCircle2 size={12} className="text-pink-500" />
          Today
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-slate-200">{completedToday}</span>
          <span className="text-[10px] text-slate-600 font-medium">/ {items.length} habits</span>
        </div>
      </div>

    </div>
  );
};