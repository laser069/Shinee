import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import type { DashboardItem, Habit } from '../types';
import { HabitsDashboard } from '../components/HabitsDashboard';
import { Plus, RefreshCw, CalendarDays } from 'lucide-react';

const getWeekLabel = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
};

const HabitsPage: React.FC = () => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; habit?: Habit }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; habitId?: string; habitName?: string }>({ open: false });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await habitService.getHabitsDashboard();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHabits(true);
    setRefreshing(false);
  };

  const handleToggle = async (habitId: string, dayIndex: number) => {
    try {
      await habitService.toggleDay(habitId, dayIndex);
      await fetchHabits(true);
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.habit._id === id);
    if (item) {
      setDeleteModal({ open: true, habitId: id, habitName: item.habit.name });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.habitId) return;
    await habitService.deleteHabit(deleteModal.habitId);
    setDeleteModal({ open: false });
    fetchHabits(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <RefreshCw className="w-4 h-4 text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 text-[#0A0A0A]">
      
      {/* ── Minimal Header ── */}
      <div className="flex items-end justify-between mb-10 pb-4 border-b-4 border-[#0A0A0A]">
        <div>
          <h1 className="text-2xl font-black text-[#0A0A0A] flex items-center gap-2 uppercase tracking-tighter">
            <span className="text-[#F5C842]">●</span>
            Habit Tracker
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#0A0A0A]/60 uppercase tracking-wider font-black">
              <CalendarDays size={12} className="text-[#F5C842]" />
              {getWeekLabel()}
            </div>
            <button
              onClick={handleRefresh}
              className="text-[10px] text-[#0A0A0A]/40 hover:text-[#F5C842] transition-colors flex items-center gap-1 font-black uppercase"
            >
              <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>

        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#0A0A0A] text-white hover:bg-[#F5C842] hover:text-[#0A0A0A] text-[11px] font-black uppercase transition-all shadow-md"
        >
          <Plus size={12} />
          New Habit
        </button>
      </div>

      {/* ── Mini Dashboard ── */}
      <div className="mb-12 origin-left">
        <HabitsDashboard items={items} />
      </div>

      {/* ── Table Section ── */}
      <div className="group">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
            Current Routine
          </div>
          <div className="h-[2px] flex-1 bg-[#0A0A0A]/10" />
          <div className="text-[10px] text-[#0A0A0A]/40 font-black uppercase tabular-nums">count: {items.length}</div>
        </div>

        {items.length === 0 ? (
          <div className="py-20 rounded-3xl border-4 border-dashed border-[#0A0A0A]/10 flex flex-col items-center justify-center bg-white">
            <p className="text-sm text-[#0A0A0A]/40 font-bold">No habits found. Start your routine today.</p>
          </div>
        ) : (
          <div className="rounded-2xl border-4 border-[#0A0A0A] bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <WeeklyHabitTracker
              items={items}
              onToggle={handleToggle}
              onEdit={(h) => setModal({ open: true, habit: h })}
              onDelete={handleDelete}
            />
            
            {/* Inline Add Row (Spreadsheet Style) */}
            <button
              onClick={() => setModal({ open: true })}
              className="w-full flex items-center gap-2 px-6 py-4 text-xs text-[#0A0A0A]/60 font-black uppercase hover:bg-[#F5C842]/10 border-t-2 border-[#0A0A0A]/10 transition-all text-left"
            >
              <Plus size={12} className="text-[#F5C842]" />
              Add new entry
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <HabitModal
          habit={modal.habit}
          onClose={() => setModal({ open: false })}
          onSuccess={() => fetchHabits(true)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        name={deleteModal.habitName || ''}
        title="Delete Habit?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false })}
      />
    </div>
  );
};

export default HabitsPage;