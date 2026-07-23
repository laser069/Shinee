import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TaskStats } from '../../types';

const STATUS_LABELS: Record<keyof TaskStats['byStatus'], string> = {
  todo: 'Backlog',
  inprogress: 'Active',
  done: 'Resolved',
};

export const TaskStatusChart: React.FC<{ taskStats: TaskStats }> = ({ taskStats }) => {
  const data = (Object.keys(taskStats.byStatus) as (keyof TaskStats['byStatus'])[]).map((key) => ({
    status: STATUS_LABELS[key],
    count: taskStats.byStatus[key],
  }));

  return (
    <div className="border-4 border-[#0A0A0A] rounded-2xl bg-white p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-4">
        Tasks by Status
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#0A0A0A1A" />
          <XAxis dataKey="status" tick={{ fontSize: 12, fontWeight: 700, fill: '#0A0A0A' }} axisLine={{ stroke: '#0A0A0A' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#0A0A0A' }} axisLine={{ stroke: '#0A0A0A' }} tickLine={false} />
          <Tooltip
            contentStyle={{ border: '3px solid #0A0A0A', borderRadius: 12, fontWeight: 700 }}
            cursor={{ fill: '#0A0A0A0D' }}
          />
          <Bar dataKey="count" fill="#F5C842" stroke="#0A0A0A" strokeWidth={2} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskStatusChart;
