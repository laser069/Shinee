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

export const HabitModal: React.FC<HabitModalProps> = ({ habit, onClose, onSuccess }) => {
  const [name, setName] = useState(habit?.name || '');
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

  const handleSelectAllDays = (checked: boolean) => {
    if (checked) {
      setFixedDays([0, 1, 2, 3, 4, 5, 6]);
    } else {
      setFixedDays([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateHabitPayload = {
        name,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/80 p-4">
      <div className="bg-white border-4 border-[#0A0A0A] w-full max-w-lg rounded-3xl shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] p-8 overflow-y-auto max-h-[90vh]">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">{isEdit ? 'Refine' : 'Add'} Routine</h2>
          <button onClick={onClose} className="text-[#0A0A0A] hover:text-[#F5C842] transition-colors"><X size={32} strokeWidth={3} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex-1">
            <label className="block text-xs font-black text-[#0A0A0A] mb-2 uppercase tracking-widest">Habit Name</label>
            <input 
              required
              className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#0A0A0A] mb-3 uppercase tracking-widest">Frequency Mode</label>
            <div className="flex gap-3">
              {(['flexible', 'fixed'] as FrequencyType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFrequencyType(type)}
                  className={`flex-1 py-4 rounded-2xl border-4 text-sm font-black uppercase tracking-widest transition-all ${
                    frequencyType === type ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' : 'bg-white border-[#0A0A0A]/10 text-[#0A0A0A]/40 hover:border-[#0A0A0A]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {frequencyType === 'fixed' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-widest">Select Days</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={fixedDays.length === 7}
                    onChange={(e) => handleSelectAllDays(e.target.checked)}
                    className="w-4 h-4 accent-[#0A0A0A]"
                  />
                  <span className="text-xs font-black text-[#0A0A0A]/60 uppercase">Every Day</span>
                </label>
              </div>
              <div className="flex justify-between gap-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`h-12 flex-1 rounded-xl font-black border-4 transition-all ${
                      fixedDays.includes(idx) ? 'bg-[#F5C842] border-[#0A0A0A] text-[#0A0A0A]' : 'bg-white border-[#0A0A0A]/10 text-[#0A0A0A]/20 hover:border-[#0A0A0A]/40'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-black text-[#0A0A0A] mb-2 uppercase tracking-widest">Weekly Goal (Times)</label>
              <input 
                type="number" min="1" max="7"
                className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] outline-none font-bold focus:bg-[#F5C842]/10"
                value={goalCount}
                onChange={(e) => setGoalCount(Number(e.target.value))}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border-4 border-[#0A0A0A] text-[#0A0A0A] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0A0A0A]/5 transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-4 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all shadow-lg active:scale-95">
              {isSubmitting ? 'Syncing...' : 'Confirm Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};