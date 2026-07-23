import React from 'react';
import { Flame, Award } from 'lucide-react';
import type { HabitBreakdownItem } from '../../types';

export const HabitBreakdownList: React.FC<{ habits: HabitBreakdownItem[] }> = ({ habits }) => {
  return (
    <div className="border-4 border-[#0A0A0A] rounded-2xl bg-white p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-4">
        Habit Breakdown
      </h3>

      {habits.length === 0 ? (
        <p className="text-sm text-[#0A0A0A]/50 font-bold">No active habits yet.</p>
      ) : (
        <div className="flex flex-col divide-y-2 divide-[#0A0A0A]/10">
          {habits.map((habit) => (
            <div key={habit.id} className="py-4 flex items-center gap-4">
              <span
                className="w-3 h-3 rounded-full border-2 border-[#0A0A0A] shrink-0"
                style={{ backgroundColor: habit.color }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-black text-[#0A0A0A] truncate">{habit.name}</p>
                <div className="mt-1.5 h-2 bg-[#0A0A0A]/10 rounded-full overflow-hidden border border-[#0A0A0A]/20">
                  <div
                    className="h-full bg-[#F5C842]"
                    style={{ width: `${habit.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-[#0A0A0A]/70 shrink-0">
                <Flame size={12} className="text-[#F5C842]" />
                {habit.dailyStreak}d
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-[#0A0A0A]/70 shrink-0 w-14 justify-end">
                <Award size={12} className="text-[#F5C842]" />
                {habit.totalPoints}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitBreakdownList;
