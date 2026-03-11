import React, { useState } from 'react';
import habitService from '../services/habitService';
import type { HabitCategory, HabitTrackingType } from '../types/api';

interface HabitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const HabitModal: React.FC<HabitModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Growth');
  const [trackingType, setTrackingType] = useState<HabitTrackingType>('binary');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await habitService.createHabit({
        name,
        category,
        trackingType,
        goal: {
          targetValue,
          unit,
          frequency
        }
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to create habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">New Habit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Habit Name</label>
            <input 
              required
              placeholder="e.g., Drink Water, Read Books"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Category</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
              >
                <option value="Health">💪 Health</option>
                <option value="Growth">🧠 Growth</option>
                <option value="Quit">🚫 Quit (Sobriety)</option>
                <option value="Social">🤝 Social</option>
                <option value="Milestone">🎯 Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Tracking Type</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                value={trackingType}
                onChange={(e) => setTrackingType(e.target.value as HabitTrackingType)}
              >
                <option value="binary">Yes / No</option>
                <option value="numeric">Quantity / Numeric</option>
                <option value="countdown">Countdown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Target Value</label>
                <input 
                  type="number"
                  min="1"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Unit (optional)</label>
                <input 
                  placeholder="steps, pages, etc."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Frequency</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  frequency === 'daily' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                Daily
              </button>
              <button 
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  frequency === 'weekly' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
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
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
