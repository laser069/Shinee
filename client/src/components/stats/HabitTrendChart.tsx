import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import type { HabitWeeklyTrendItem } from '../../types';

export const HabitTrendChart: React.FC<{ weeklyTrend: HabitWeeklyTrendItem[] }> = ({ weeklyTrend }) => {
  const data = weeklyTrend.map((w) => ({
    week: dayjs(w.weekStart).format('MMM D'),
    completions: w.timesCompleted,
  }));

  return (
    <div className="border-4 border-[#0A0A0A] rounded-2xl bg-white p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-4">
        Weekly Habit Completions
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#0A0A0A1A" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 700, fill: '#0A0A0A' }} axisLine={{ stroke: '#0A0A0A' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#0A0A0A' }} axisLine={{ stroke: '#0A0A0A' }} tickLine={false} />
          <Tooltip
            contentStyle={{ border: '3px solid #0A0A0A', borderRadius: 12, fontWeight: 700 }}
          />
          <Line
            type="monotone"
            dataKey="completions"
            stroke="#0A0A0A"
            strokeWidth={3}
            dot={{ r: 4, fill: '#F5C842', stroke: '#0A0A0A', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitTrendChart;
