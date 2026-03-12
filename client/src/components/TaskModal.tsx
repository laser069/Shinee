import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import type { Task, TaskStatus } from '../types';
import { Layout, X, Trash2, Clock } from 'lucide-react';

interface TaskModalProps {
  boardId: string;
  defaultStatus: TaskStatus;
  task?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ boardId, defaultStatus, task, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!task;

  // FIX: Sync status when double-clicking different columns
  useEffect(() => {
    if (!isEditMode) {
      setStatus(defaultStatus);
      // Clear fields for a fresh "Create" experience
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  }, [defaultStatus, isEditMode]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setDueDate(localDate.toISOString().slice(0, 16));
      }
    }
  }, [task]);

  const handleQuickDate = (hours = 0, days = 0) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    now.setDate(now.getDate() + days);
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDueDate(localISO);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const isoDueDate = dueDate ? new Date(dueDate).toISOString() : null;
      const payload = { title: title.trim(), description: description.trim(), status, dueDate: isoDueDate };

      if (isEditMode && task) {
        await taskService.updateTask(task._id, payload);
      } else {
        await taskService.createTask({ ...payload, boardId });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm("Delete this task?")) return;
    try {
      await taskService.deleteTask(task._id);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1e293b] border border-slate-700/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <header className="px-8 py-6 flex items-center justify-between bg-slate-800/20 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isEditMode ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Layout className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{isEditMode ? 'Edit Task' : 'New Task'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <input required autoFocus placeholder="Task Title" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" rows={2} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none resize-none text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><Clock className="w-3.5 h-3.5" /> Set Deadline</label>
            <div className="flex flex-col gap-3">
              <input type="datetime-local" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none [color-scheme:dark]" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => handleQuickDate(2, 0)} className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:border-indigo-500 transition-colors">+ 2 Hours</button>
                <button type="button" onClick={() => handleQuickDate(0, 2)} className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:border-indigo-500 transition-colors">+ 2 Days</button>
                <button type="button" onClick={() => setDueDate('')} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-red-400">Clear</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['todo', 'inprogress', 'done'] as TaskStatus[]).map((id) => (
              <button key={id} type="button" onClick={() => setStatus(id)} className={`py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${status === id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-900/30 border-slate-800 text-slate-600'}`}>{id}</button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditMode && (
              <button type="button" onClick={handleDelete} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
            )}
            <button type="submit" disabled={isSubmitting} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};