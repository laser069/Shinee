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
    <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-[#0A0A0A] rounded-2xl bg-white divide-x-2 divide-[#0A0A0A] overflow-hidden shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
      
      {/* Average Completion */}
      <div className="px-6 py-5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
          <Target size={12} className="text-[#F5C842]" />
          Completion
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-[#0A0A0A]">{Math.round(averageProgress)}%</span>
          <div className="flex-1 h-2 bg-[#0A0A0A]/10 rounded-full overflow-hidden max-w-[40px] border border-[#0A0A0A]/20">
            <div 
              className="h-full bg-[#0A0A0A]" 
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Count */}
      <div className="px-6 py-5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
          <Flame size={12} className="text-[#F5C842]" />
          Total Streak
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-[#0A0A0A]">{totalDailyStreak}</span>
          <span className="text-[10px] text-[#0A0A0A]/60 font-black uppercase">days</span>
        </div>
      </div>

      {/* Experience Points */}
      <div className="px-6 py-5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
          <Award size={12} className="text-[#F5C842]" />
          Discipline
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-[#0A0A0A]">{totalPoints.toLocaleString()}</span>
          <span className="text-[10px] text-[#0A0A0A]/60 font-black uppercase tracking-tighter">XP</span>
        </div>
      </div>

      {/* Daily Status */}
      <div className="px-6 py-5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
          <CheckCircle2 size={12} className="text-[#F5C842]" />
          Today
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-[#0A0A0A]">{completedToday}</span>
          <span className="text-[10px] text-[#0A0A0A]/60 font-black uppercase">/ {items.length} habits</span>
        </div>
      </div>

    </div>
  );
};