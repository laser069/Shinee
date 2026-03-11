import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import type { Habit } from '../types/api';

interface WeeklyHabitTrackerProps {
  habits: Habit[];
  onToggle: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; habitBg: string }> = {
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', habitBg: 'bg-indigo-50' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', habitBg: 'bg-rose-50' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', habitBg: 'bg-emerald-50' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', habitBg: 'bg-amber-50' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', habitBg: 'bg-blue-50' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', habitBg: 'bg-purple-50' },
};

export const WeeklyHabitTracker: React.FC<WeeklyHabitTrackerProps> = ({ habits, onToggle, onDelete }) => {
  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm overflow-x-auto font-sans">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-200 text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
            <th className="p-3 font-medium">Habits</th>
            <th className="p-3 font-medium">Goal</th>
            {DAYS_OF_WEEK.map(day => (
              <th key={day} className="p-3 font-medium text-center w-12">
                {day}
              </th>
            ))}
            <th className="p-3 font-medium w-40 text-left">Formula</th>
            <th className="p-3 font-medium w-12 text-center"></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {habits.map((habit) => {
            const colors = COLOR_MAP[habit.ui?.color] || COLOR_MAP.indigo;
            
            return (
              <tr key={habit._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                {/* Habit Column */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={true} // Repersents "Active" as per prompt
                      readOnly
                      className="w-3.5 h-3.5 rounded-sm border-gray-300 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-default"
                    />
                    <div className={`px-1.5 py-0.5 rounded flex items-center gap-1.5 ${colors.habitBg}`}>
                      <span className="text-base leading-none">{habit.ui?.icon || '🎯'}</span>
                      <span className="font-medium text-gray-700 text-[13px]">{habit.name}</span>
                    </div>
                  </div>
                </td>

                {/* Goal Column */}
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text}`}>
                    {habit.goal?.weeklyTarget || habit.goal?.targetValue} x per week
                  </span>
                </td>
                
                {/* Day Columns */}
                {habit.grid?.map((dayObj, idx) => {
                  const isScheduled = dayObj.isScheduled;
                  const isCompleted = dayObj.isCompleted;

                  return (
                    <td key={idx} className="p-2 text-center">
                      <button
                        onClick={() => onToggle(habit._id, dayObj.date)}
                        className={`w-5 h-5 flex items-center justify-center rounded-sm transition-all duration-200 border ${
                          !isScheduled 
                            ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-40' 
                            : isCompleted
                              ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                              : 'bg-white border-gray-200 hover:border-indigo-300 shadow-sm'
                        }`}
                        title={isScheduled ? (`${isCompleted ? 'Unmark' : 'Mark'} as completed`) : 'Not scheduled'}
                      >
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>
                  );
                })}

                {/* Formula Column (Progress) */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-gray-500 w-8 tabular-nums">
                      {habit.weeklyProgress || 0}%
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${habit.weeklyProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-3 text-center">
                   <button 
                    onClick={() => onDelete(habit._id)}
                    className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
