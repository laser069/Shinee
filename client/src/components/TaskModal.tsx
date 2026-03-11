import React, { useState } from 'react';
import taskService from '../services/taskService';
import type { TaskStatus } from '../types/api';
import { Layout, X, Info, AlignLeft } from 'lucide-react';

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await taskService.createTask({
        title,
        description,
        status,
        boardId
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#1e293b] border border-slate-700/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 pb-2">
        <header className="px-8 py-6 flex items-center justify-between border-b border-slate-700/30">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Layout className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">New Objective</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">
                <Info className="w-3 h-3" />
                Title
              </label>
              <input 
                required
                autoFocus
                placeholder="What needs to be done?"
                className="w-full bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">
                <AlignLeft className="w-3 h-3" />
                Context & Notes
              </label>
              <textarea 
                required
                rows={4}
                placeholder="Explain the technical details or requirements..."
                className="w-full bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600 font-medium resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">
                Pipeline Stage
              </label>
              <div className="grid grid-cols-3 gap-3">
                 {['todo', 'inprogress', 'done'].map((s) => (
                   <button
                     key={s}
                     type="button"
                     onClick={() => setStatus(s as TaskStatus)}
                     className={`py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all border-2 ${
                       status === s 
                         ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                         : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                     }`}
                   >
                     {s === 'inprogress' ? 'In Progress' : s}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-4 text-slate-400 hover:text-white font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? 'Syncing...' : 'Deploy Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};