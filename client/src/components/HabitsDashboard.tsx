import React from 'react';
import { Flame, Target, TrendingUp, Award } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
      {/* Total Progress Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] backdrop-blur-sm group hover:border-indigo-500/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-500">
            <Target size={24} />
          </div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Weekly Goal</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{Math.round(averageProgress)}%</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
            style={{ width: `${averageProgress}%` }}
          />
        </div>
      </div>

      {/* Streak Points Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] backdrop-blur-sm group hover:border-orange-500/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400 group-hover:scale-110 transition-transform duration-500">
            <Flame size={24} />
          </div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Streaks</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{totalDailyStreak}</span>
          <span className="text-sm font-bold text-slate-500">Days</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 font-medium">Accumulated across all habits</p>
      </div>

      {/* Points Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] backdrop-blur-sm group hover:border-emerald-500/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform duration-500">
            <Award size={24} />
          </div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Streak Points</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{totalPoints.toLocaleString()}</span>
          <span className="text-sm font-bold text-slate-500">XP</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 font-medium">Global discipline score</p>
      </div>

      {/* Daily Momentum Card */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] backdrop-blur-sm group hover:border-pink-500/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={24} />
          </div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Today</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{completedToday}</span>
          <span className="text-sm font-bold text-slate-500">/ {items.length} Done</span>
        </div>
        <p className="mt-2 text-xs text-slate-600 font-medium">Daily momentum status</p>
      </div>
    </div>
  );
};
