import React, { useState } from 'react';
import { Trash2, ListChecks } from 'lucide-react';
import type { Subtask } from '../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks, onChange }) => {
  const [newTitle, setNewTitle] = useState('');

  const total = subtasks.length;
  const done = subtasks.filter(s => s.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    onChange([...subtasks, { title, completed: false }]);
    setNewTitle('');
  };

  const handleToggle = (index: number) => {
    onChange(subtasks.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s)));
  };

  const handleRemove = (index: number) => {
    onChange(subtasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest px-1">
        <ListChecks className="w-4 h-4 text-[#F5C842]" /> Subtasks {total > 0 && `(${done}/${total})`}
      </label>

      {total > 0 && (
        <div className="w-full h-3 rounded-full border-2 border-[#0A0A0A] bg-white overflow-hidden">
          <div className="h-full bg-[#F5C842] transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {total > 0 && (
        <ul className="space-y-2">
          {subtasks.map((subtask, i) => (
            <li key={subtask._id ?? i} className="flex items-center gap-3 bg-white border-4 border-[#0A0A0A] rounded-2xl p-3">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggle(i)}
                className="w-5 h-5 accent-[#F5C842] cursor-pointer"
              />
              <span className={`flex-1 font-bold text-sm text-[#0A0A0A] ${subtask.completed ? 'line-through opacity-40' : ''}`}>
                {subtask.title}
              </span>
              <button type="button" onClick={() => handleRemove(i)} className="text-[#0A0A0A]/40 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a subtask"
          maxLength={120}
          className="flex-1 bg-white border-4 border-[#0A0A0A] rounded-2xl p-3 text-[#0A0A0A] outline-none font-bold text-sm"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        />
        <button type="button" onClick={handleAdd} className="px-5 py-3 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all">
          Add
        </button>
      </div>
    </div>
  );
};
