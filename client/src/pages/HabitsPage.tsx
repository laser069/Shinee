import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import type { Habit } from '../types/api';
import { 
  Plus
} from 'lucide-react';

const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await habitService.getHabitsDashboard();
      setHabits(data);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      if (!silent) setLoading(false);
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
      // Final sync for stats (Silent)
      await fetchHabits(true);
    } catch (err) {
      console.error(err);
      await fetchHabits(true);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(undefined);
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
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📔</div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Habit Tracker</h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>
          <p className="mt-2 text-gray-500 font-medium text-[15px] border-b border-gray-200 pb-4">
            Track your daily discipline and monitor weekly progress at a glance.
          </p>
        </header>

        <div className="mt-6">
          {habits.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 py-20 rounded-lg text-center">
               <div className="text-4xl mb-4 text-gray-300">🍃</div>
               <h3 className="text-lg font-semibold text-gray-700">No habits yet</h3>
               <p className="text-gray-400 text-sm mb-6">Start tracking your journey today.</p>
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
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        <footer className="mt-8 flex items-center justify-between text-[12px] text-gray-400">
           <div className="flex gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
               <span>In Progress</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span>Completed</span>
             </div>
           </div>
           <div>
             Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </footer>
      </div>

      {isModalOpen && (
        <HabitModal 
          habit={editingHabit}
          onClose={handleCloseModal}
          onSuccess={fetchHabits} 
        />
      )}
    </div>
  );
};

export default HabitsPage;
