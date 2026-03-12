import React, { useEffect, useState } from 'react';
import habitService from '../services/habitService';
import { HabitModal } from '../components/HabitModal';
import { WeeklyHabitTracker } from '../components/WeeklyHabitTracker';
import type { DashboardItem, Habit } from '../types';
import { HabitsDashboard } from '../components/HabitsDashboard';
import { Plus, RefreshCw, CheckSquare } from 'lucide-react';

// Returns "Week of Mon DD – Sun DD"
const getWeekLabel = () => {
  const now = new Date();
  const day = now.getDay(); // Sun=0
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
    if (!confirm('Permanently delete this habit and all its history?')) return;
    await habitService.deleteHabit(id);
    fetchHabits(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
          <span className="text-sm">Loading tracker…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* ── Page Header (Notion-style) ── */}
      <div className="mb-8">
        {/* Big icon */}
        <div className="text-5xl mb-3 select-none">✅</div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white tracking-tight mb-1">
          Weekly Habit Tracker
        </h1>

        {/* Sub-row: week label + reset button */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 border border-slate-700/60 hover:border-slate-600 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/70 transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Reset week
          </button>
          <span className="text-sm text-slate-500">{getWeekLabel()}</span>
        </div>
      </div>

      {/* ── Habits Dashboard ── */}
      <HabitsDashboard items={items} />

      {/* ── Section Label (Notion database group) ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <CheckSquare size={15} className="text-indigo-400" />
          Weekly Habits
          <span className="ml-1 text-xs text-slate-600 font-normal">
            ({items.length})
          </span>
        </div>

        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={15} />
          New habit
        </button>
      </div>

      {/* ── Tracker Table ── */}
      {items.length === 0 ? (
        <div className="text-center py-20 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/20">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-400 font-medium">No habits yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Click "New habit" to start building your routine.
          </p>
        </div>
      ) : (
        <WeeklyHabitTracker
          items={items}
          onToggle={handleToggle}
          onEdit={(h) => setModal({ open: true, habit: h })}
          onDelete={handleDelete}
        />
      )}

      {/* ── Add row shortcut below table ── */}
      {items.length > 0 && (
        <button
          onClick={() => setModal({ open: true })}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 text-sm text-slate-600 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg transition-all w-full border border-transparent hover:border-slate-800"
        >
          <Plus size={14} />
          New habit
        </button>
      )}

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