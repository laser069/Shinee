import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import type { Habit } from '../types/api';
import { 
  Plus, 
  Settings,
  MoreHorizontal
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
      // Optimistic Update
      setHabits(prev => prev.map(h => {
        if (h._id === habitId && h.grid) {
          const newGrid = h.grid.map(g => g.date === date ? { ...g, isCompleted: !g.isCompleted } : g);
          const completedCount = newGrid.filter(g => g.isCompleted).length;
          const scheduledCount = h.goal.scheduledDays.length || 1;
          const progress = Math.min(Math.round((completedCount / scheduledCount) * 100), 100);
          return { ...h, grid: newGrid, weeklyProgress: progress };
        }
        return h;
      }));
      
      await habitService.toggleDay({ habitId, date });
      // Final sync
      await fetchHabits();
    } catch (err) {
      console.error(err);
      await fetchHabits();
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!window.confirm("Delete this habit forever?")) return;
    try {
      await habitService.deleteHabit(habitId);
      await fetchHabits();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-400">Loading your habits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <div className="max-w-6xl mx-auto pt-12 px-6">
        {/* Notion-style Header */}
        <header className="mb-8 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-gray-300 opacity-60 group-hover:opacity-100 transition-opacity">
               <div className="p-1 hover:bg-gray-100 rounded cursor-pointer"><Settings className="w-5 h-5" /></div>
               <div className="p-1 hover:bg-gray-100 rounded cursor-pointer"><MoreHorizontal className="w-5 h-5" /></div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Habit
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-4xl">📔</div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Weekly Habit Tracker</h1>
          </div>
          <p className="mt-2 text-gray-500 font-medium text-[15px] border-b border-gray-200 pb-4">
            Track your daily discipline and monitor weekly progress at a glance.
          </p>
        </header>

        {/* The Tracker Component */}
        <div className="mt-6">
          {habits.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-20 rounded-lg text-center">
               <div className="text-4xl mb-4 text-gray-300">🍃</div>
               <h3 className="text-lg font-semibold text-gray-700">No habits yet</h3>
               <p className="text-gray-400 text-sm mb-6">Click "New Habit" to start tracking your journey.</p>
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="text-indigo-600 font-bold hover:underline"
               >
                 Create your first habit
               </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <WeeklyHabitTracker 
                habits={habits}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        {/* Legend / Footer */}
        <footer className="mt-8 flex items-center justify-between text-[12px] text-gray-400">
           <div className="flex gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-indigo-500" />
               <span>In Progress</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span>Completed</span>
             </div>
           </div>
           <div>
             Last updated: {new Date().toLocaleDateString()}
           </div>
        </footer>
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
