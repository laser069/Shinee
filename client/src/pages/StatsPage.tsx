import React, { useEffect, useState } from 'react';
import { ListChecks, Clock, AlertTriangle, CheckCircle2, Award, Flame, Target } from 'lucide-react';
import statsService from '../services/statsService';
import type { StatsOverview } from '../types';
import { StatCard } from '../components/stats/StatCard';
import { TaskStatusChart } from '../components/stats/TaskStatusChart';
import { HabitTrendChart } from '../components/stats/HabitTrendChart';
import { HabitBreakdownList } from '../components/stats/HabitBreakdownList';

const formatMinutes = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
};

export const StatsPage: React.FC = () => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    statsService
      .getOverview(8)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load stats. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-center text-[#0A0A0A]/50 font-bold">
        Loading stats...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 text-center text-red-600 font-bold">
        {error || 'No data available.'}
      </div>
    );
  }

  const { taskStats, habitStats } = overview;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">STATS</h1>
        <p className="text-[#0A0A0A]/50 font-bold mt-1">Your productivity, at a glance.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-[#0A0A0A] rounded-2xl bg-white divide-x-2 divide-[#0A0A0A] overflow-hidden shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
        <StatCard icon={ListChecks} label="Total Tasks" value={taskStats.total} />
        <StatCard icon={CheckCircle2} label="Completed" value={taskStats.byStatus.done} />
        <StatCard icon={AlertTriangle} label="Overdue" value={taskStats.overdueCount} />
        <StatCard icon={Clock} label="Time Logged" value={formatMinutes(taskStats.totalTimeSpent)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-[#0A0A0A] rounded-2xl bg-white divide-x-2 divide-[#0A0A0A] overflow-hidden shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
        <StatCard icon={Target} label="Active Habits" value={habitStats.totalHabits} />
        <StatCard icon={Award} label="Total XP" value={habitStats.totalPoints} />
        <StatCard icon={Flame} label="Avg Streak" value={habitStats.avgDailyStreak} suffix="days" />
        <StatCard icon={Flame} label="Longest Streak" value={habitStats.longestStreakOverall} suffix="days" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart taskStats={taskStats} />
        <HabitTrendChart weeklyTrend={habitStats.weeklyTrend} />
      </div>

      <HabitBreakdownList habits={habitStats.perHabitBreakdown} />
    </div>
  );
};

export default StatsPage;
