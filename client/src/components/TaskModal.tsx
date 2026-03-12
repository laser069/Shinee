import React, { useState } from 'react';
import taskService from '../services/taskService';
import type { TaskStatus } from '../types';
import { Layout, X, Info, AlignLeft, BarChart2 } from 'lucide-react';

interface TaskModalProps {
  boardId: string;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ boardId, defaultStatus, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        boardId
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("System failed to deploy task. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status mapping for better visual recognition
  const statusOptions: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'border-slate-500 text-slate-400' },
    { id: 'inprogress', label: 'In Progress', color: 'border-amber-500 text-amber-400' },
    { id: 'done', label: 'Done', color: 'border-emerald-500 text-emerald-400' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-[#1e293b] border border-slate-700/50 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header Section */}
        <header className="px-8 py-6 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Task</h2>
              <p className="text-slate-500 text-xs">Add a new item to your workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Core Details */}
          <div className="space-y-5">
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2.5 ml-1">
                <Info className="w-3.5 h-3.5" />
                Task Title
              </label>
              <input
                required
                autoFocus
                placeholder="e.g., Design System Update"
                className="w-full bg-slate-900/40 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:bg-slate-900 transition-all outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                <AlignLeft className="w-3.5 h-3.5" />
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe the objective..."
                className="w-full bg-slate-900/40 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:bg-slate-900 transition-all outline-none resize-none text-sm leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Pipeline Selection */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
              <BarChart2 className="w-3.5 h-3.5" />
              Initial Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatus(opt.id)}
                  className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all border-2 ${
                    status === opt.id
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-inner'
                      : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase ${status === opt.id ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 text-slate-500 hover:text-slate-300 font-bold transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? 'Processing...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};