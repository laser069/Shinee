import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import type { DashboardItem, Habit } from '../types';
import { HabitsDashboard } from '../components/HabitsDashboard';
import { Plus, RefreshCw, CheckSquare, CalendarDays } from 'lucide-react';

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
    if (!confirm('Delete habit?')) return;
    await habitService.deleteHabit(id);
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
    <div className="max-w-6xl mx-auto px-8 py-8 text-slate-300">
      
      {/* ── Minimal Header ── */}
      <div className="flex items-end justify-between mb-10 pb-4 border-b border-slate-800/50">
        <div>
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-500 text-base">●</span>
            Habit Tracker
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              <CalendarDays size={12} />
              {getWeekLabel()}
            </div>
            <button
              onClick={handleRefresh}
              className="text-[10px] text-slate-600 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>

        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-[11px] font-medium transition-all"
        >
          <Plus size={12} />
          New Habit
        </button>
      </div>

      {/* ── Mini Dashboard ── */}
      <div className="mb-8 opacity-80 scale-95 origin-left">
        <HabitsDashboard items={items} />
      </div>

      {/* ── Table Section ── */}
      <div className="group">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
            Current Routine
          </div>
          <div className="h-[1px] flex-1 bg-slate-800/50" />
          <div className="text-[10px] text-slate-700 tabular-nums">count: {items.length}</div>
        </div>

        {items.length === 0 ? (
          <div className="py-12 rounded border border-dashed border-slate-800 flex flex-col items-center justify-center">
            <p className="text-[11px] text-slate-600">No data available in this view</p>
          </div>
        ) : (
          <div className="rounded-sm border border-slate-800 bg-[#0b0f1a]/30">
            <WeeklyHabitTracker
              items={items}
              onToggle={handleToggle}
              onEdit={(h) => setModal({ open: true, habit: h })}
              onDelete={handleDelete}
            />
            
            {/* Inline Add Row (Spreadsheet Style) */}
            <button
              onClick={() => setModal({ open: true })}
              className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 border-t border-slate-800 transition-all text-left"
            >
              <Plus size={12} />
              New row
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
    </div>
  );
};

export default HabitsPage;