import React from 'react';
import { Check, Edit2, Trash2 } from 'lucide-react';
import type { Habit } from '../types/api';

interface WeeklyHabitTrackerProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyHabitTracker: React.FC<WeeklyHabitTrackerProps> = ({ habits, onToggle, onDelete }) => {
  if (habits.length === 0) {
    return null; // or a fallback
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <th className="p-4 bg-slate-900/50">Habits</th>
            <th className="p-4 bg-slate-900/50">Goal</th>
            {DAYS_OF_WEEK.map(day => (
              <th key={day} className="p-4 bg-slate-900/50 text-center w-14">
                {day}
              </th>
            ))}
            <th className="p-4 bg-slate-900/50 w-32">Progress</th>
            <th className="p-4 bg-slate-900/50 w-16 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {habits.map((habit) => (
            <tr key={habit._id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors group">
              <td className="p-4 font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    habit.category === 'Health' ? 'bg-emerald-500' :
                    habit.category === 'Growth' ? 'bg-indigo-500' :
                    habit.category === 'Quit' ? 'bg-rose-500' :
                    'bg-amber-500'
                  }`} />
                  {habit.name}
                </div>
              </td>
              <td className="p-4 text-slate-400">
                {habit.goal.targetValue} {habit.goal.unit || 'times'} / week
              </td>
              
              {/* Grid map */}
              {habit.grid?.map((dayObj, idx) => {
                const isScheduled = dayObj.isScheduled;
                const isCompleted = dayObj.isCompleted;

                return (
                  <td key={idx} className="p-4 text-center">
                    <button
                      onClick={() => onToggle(habit._id, dayObj.date)}
                      disabled={!isScheduled}
                      className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-200 ${
                        !isScheduled 
                          ? 'bg-slate-800/30 border border-slate-800/50 cursor-not-allowed opacity-40' 
                          : isCompleted
                            ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-800 border border-slate-700 hover:border-indigo-400 hover:bg-slate-700 cursor-pointer text-transparent hover:text-indigo-400/30'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  </td>
                );
              })}

              <td className="p-4 pr-8">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${habit.weeklyProgress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300 w-8">{habit.weeklyProgress || 0}%</span>
                </div>
              </td>

              <td className="p-4 text-center">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onDelete(habit._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
