import React, { useState } from 'react';
import habitService from '../services/habitService';
import type { Habit, CreateHabitPayload, FrequencyType } from '../types';
import { X } from 'lucide-react';

interface HabitModalProps {
  habit?: Habit;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#a855f7'];
const ICONS = ['🎯', '💧', '📚', '🧘', '🏃', '🥗', '💻', '💤', '💰', '🧠'];

export const HabitModal: React.FC<HabitModalProps> = ({ habit, onClose, onSuccess }) => {
  const [name, setName] = useState(habit?.name || '');
  const [icon, setIcon] = useState(habit?.icon || '🎯');
  const [color, setColor] = useState(habit?.color || '#6366f1');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(habit?.frequencyType || 'flexible');
  const [goalCount, setGoalCount] = useState(habit?.goalCount || 1);
  const [fixedDays, setFixedDays] = useState<number[]>(habit?.fixedDays || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!habit;

  const toggleDay = (day: number) => {
    setFixedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateHabitPayload = {
        name,
        icon,
        color,
        frequencyType,
        goalCount,
        fixedDays: frequencyType === 'fixed' ? fixedDays : []
      };

      if (isEdit && habit) {
        await habitService.updateHabit(habit._id, payload);
      } else {
        await habitService.createHabit(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(`Failed to save habit`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white italic">{isEdit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Habit Name</label>
              <input 
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Icon</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none cursor-pointer"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Frequency Mode</label>
            <div className="flex gap-2">
              {(['flexible', 'fixed'] as FrequencyType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFrequencyType(type)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold capitalize transition-all ${
                    frequencyType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {frequencyType === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Days</label>
              <div className="flex justify-between">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`w-10 h-10 rounded-lg font-bold border transition-all ${
                      fixedDays.includes(idx) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Weekly Goal (Times)</label>
              <input 
                type="number" min="1" max="7"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none"
                value={goalCount}
                onChange={(e) => setGoalCount(Number(e.target.value))}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-xl font-bold">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">
              {isSubmitting ? 'Saving...' : 'Save Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};