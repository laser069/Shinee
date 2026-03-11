import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import type { Habit } from '../types/api';
import { 
  Activity, 
  Flame, 
  Plus, 
  Trophy 
} from 'lucide-react';

const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitService.getHabitsDashboard();
      setHabits(data);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (habitId: string, date: string) => {
    try {
      // Optimistically update the UI to make the interaction snappy
      setHabits(prev => prev.map(h => {
        if (h._id === habitId && h.grid) {
          return {
            ...h,
            grid: h.grid.map(g => {
              if (g.date === date) {
                return { ...g, isCompleted: !g.isCompleted };
              }
              return g;
            })
          };
        }
        return h;
      }));
      
      await habitService.toggleDay({ habitId, date });
      // We could fetchHabits() here, but optimistic update is usually enough
      // To be safe and update weekly progress calculation, let's re-fetch
      await fetchHabits();
    } catch (err) {
      alert("Failed to log activity");
      // Revert in case of failure
      await fetchHabits();
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!window.confirm("Are you sure you want to delete this habit? All log history will be lost.")) return;
    try {
      await habitService.deleteHabit(habitId);
      await fetchHabits();
    } catch (err) {
      alert("Failed to delete habit");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-xl font-medium">Loading habits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="flex justify-between items-center mb-10 px-4 md:px-0">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">HABIT TRACKER</h1>
          <p className="text-slate-400 text-lg mt-1 font-medium">Small wins lead to big changes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-500 transition-all px-8 py-4 rounded-2xl font-bold text-white shadow-xl shadow-indigo-600/30 flex items-center gap-3 group active:scale-95"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden md:inline">Track New Habit</span>
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4 md:px-0">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest">Active habits</h3>
          </div>
          <p className="text-4xl font-black text-white">{habits.length}</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-500/20 p-3 rounded-2xl text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest">Best Streak</h3>
          </div>
          <p className="text-4xl font-black text-white">
            {habits.length > 0 ? Math.max(...habits.map(h => h.gamification.highestStreak || 0)) : 0} days
          </p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest">Points Today</h3>
          </div>
          <p className="text-4xl font-black text-white">Coming Soon</p>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="px-4 md:px-0 pb-20">
        {habits.length === 0 ? (
          <div className="bg-slate-800/20 border-2 border-dashed border-slate-700/50 p-20 rounded-3xl text-center">
            <div className="bg-slate-800 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No habits tracked yet</h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Start your journey by adding your first habit. Discipline is built one day at a time.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all"
            >
              Add First Habit
            </button>
          </div>
        ) : (
          <WeeklyHabitTracker 
            habits={habits}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </div>

      {isModalOpen && (
        <HabitModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchHabits} 
        />
      )}
    </div>
  );
};

export default HabitsPage;
