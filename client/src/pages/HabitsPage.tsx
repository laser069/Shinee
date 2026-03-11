import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import type { Habit } from '../types/api';
import { 
  Activity, 
  Flame, 
  Plus, 
  Trophy, 
  CheckCircle2, 
  Circle, 
  TrendingUp,
  AlertTriangle,
  History
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

  const handleLogActivity = async (habitId: string, value: number) => {
    try {
      await habitService.logActivity({ habitId, value });
      fetchHabits(); // Refresh dashboard
    } catch (err) {
      alert("Failed to log activity");
    }
  };

  const handleRelapse = async (habitId: string) => {
    if (!window.confirm("Are you sure you want to log a relapse? This will reset your streak.")) return;
    try {
      await habitService.handleRelapse(habitId);
      fetchHabits();
    } catch (err) {
      alert("Failed to record relapse");
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
            {habits.length > 0 ? Math.max(...habits.map(h => h.gamification.highestStreak)) : 0} days
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
      <div className="grid grid-cols-1 gap-6 px-4 md:px-0">
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
          habits.map(habit => (
            <div 
              key={habit._id} 
              className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 hover:border-indigo-500/30 transition-all group flex flex-col md:flex-row md:items-center gap-8 backdrop-blur-sm"
            >
              {/* Habit Brief */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    habit.category === 'Health' ? 'bg-blue-500/20 text-blue-400' :
                    habit.category === 'Quit' ? 'bg-red-500/20 text-red-400' :
                    habit.category === 'Growth' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {habit.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
                    <Flame className="w-4 h-4 fill-orange-400" />
                    {habit.gamification.currentStreak} day streak
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                  {habit.name}
                </h2>
                <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Target: {habit.goal.targetValue} {habit.goal.unit} / {habit.goal.frequency}
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="md:w-64 flex flex-col gap-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Progress</span>
                  <span className="text-white font-black">{Math.round((habit.progress || 0) * 100)}%</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min((habit.progress || 0) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {habit.category === 'Quit' ? (
                  <button 
                    onClick={() => handleRelapse(habit._id)}
                    className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all group flex items-center gap-2"
                    title="Log Relapse"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-bold sm:hidden">Relapse</span>
                  </button>
                ) : (
                  <button 
                    disabled={habit.isCompletedToday}
                    onClick={() => handleLogActivity(habit._id, habit.goal.targetValue)}
                    className={`p-4 rounded-2xl transition-all flex items-center gap-2 active:scale-90 ${
                      habit.isCompletedToday 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'
                    }`}
                  >
                    {habit.isCompletedToday ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    <span className="font-black uppercase text-sm tracking-wide">
                      {habit.isCompletedToday ? 'Done Today' : 'Mark Done'}
                    </span>
                  </button>
                )}
                
                <button 
                  className="p-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl hover:bg-slate-700 transition-all"
                  title="View History"
                >
                  <History className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))
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
