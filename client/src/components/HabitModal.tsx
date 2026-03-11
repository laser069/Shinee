import React, { useState } from 'react';
import habitService from '../services/habitService';
import type { Habit, HabitCategory } from '../types/api';

interface HabitModalProps {
  habit?: Habit; // If provided, we are in Edit mode
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = ['indigo', 'rose', 'emerald', 'amber', 'blue', 'purple'];
const ICONS = ['🎯', '💧', '📚', '🧘', '🏃', '🥗', '💻', '💤', '💰', '🧠'];

export const HabitModal: React.FC<HabitModalProps> = ({ habit, onClose, onSuccess }) => {
  const [name, setName] = useState(habit?.name || '');
  const [category, setCategory] = useState<HabitCategory>(habit?.category || 'Growth');
  const [icon, setIcon] = useState(habit?.ui?.icon || '🎯');
  const [color, setColor] = useState(habit?.ui?.color || 'indigo');
  const [targetValue, setTargetValue] = useState(habit?.goal?.targetValue || 1);
  const [weeklyTarget, setWeeklyTarget] = useState(habit?.goal?.weeklyTarget || 5);
  const [unit, setUnit] = useState(habit?.goal?.unit || 'times');
  const [scheduledDays, setScheduledDays] = useState<number[]>(habit?.goal?.scheduledDays || [1, 2, 3, 4, 5]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!habit;

  const toggleDay = (day: number) => {
    setScheduledDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        category,
        ui: { icon, color },
        goal: {
          type: 'boolean' as const,
          targetValue,
          unit,
          frequency: 'daily' as const,
          scheduledDays,
          weeklyTarget,
          difficulty: 'medium' as const
        }
      };

      if (isEdit && habit) {
        await habitService.updateHabit(habit._id, payload);
      } else {
        await habitService.createHabit(payload as any);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(`Failed to ${isEdit ? 'update' : 'create'} habit`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <header className="flex justify-between items-center mb-6 sticky top-0 bg-[#1e293b] py-2 z-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isEdit ? 'Update Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Habit Name</label>
              <input 
                required
                placeholder="e.g., Drink Water"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Icon</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer text-xl"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Color Theme</label>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  } ${
                    c === 'indigo' ? 'bg-indigo-500' :
                    c === 'rose' ? 'bg-rose-500' :
                    c === 'emerald' ? 'bg-emerald-500' :
                    c === 'amber' ? 'bg-amber-500' :
                    c === 'blue' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Category</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
            >
              <option value="Health">💪 Health</option>
              <option value="Growth">🧠 Growth</option>
              <option value="Quit">🚫 Quit</option>
              <option value="Social">🤝 Social</option>
              <option value="Finance">💰 Finance</option>
              <option value="Mind">🧘 Mind</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Scheduled Days</label>
            <div className="flex justify-between gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`w-9 h-9 rounded-lg font-bold transition-all text-xs border ${
                    scheduledDays.includes(idx)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Target Value</label>
              <input 
                type="number"
                min="1"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Weekly Target</label>
              <input 
                type="number"
                min="1"
                max="7"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Unit</label>
              <input 
                placeholder="times, ml, etc."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Habit' : 'Create Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
