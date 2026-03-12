import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import type { Task, TaskStatus } from '../types';
import { Layout, X, Info, AlignLeft, BarChart2, Trash2 } from 'lucide-react';

interface TaskModalProps {
  boardId: string;
  defaultStatus: TaskStatus;
  task?: Task | null; // Optional task for Edit Mode
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ boardId, defaultStatus, task, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!task;

  // Sync state if task changes (important for editing)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode && task) {
        await taskService.updateTask(task._id, { title, description, status });
      } else {
        await taskService.createTask({ title, description, status, boardId });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Action failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm("Permanently delete this task?")) return;
    
    setIsSubmitting(true);
    try {
      await taskService.deleteTask(task._id);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to delete task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#1e293b] border border-slate-700/50 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <header className="px-8 py-6 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isEditMode ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{isEditMode ? 'Edit Task' : 'Create Task'}</h2>
              <p className="text-slate-500 text-xs">{isEditMode ? 'Modify existing task details' : 'Add a new item to workspace'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">
                <Info className="w-3.5 h-3.5" /> Task Title
              </label>
              <input required autoFocus placeholder="Task title..." className="w-full bg-slate-900/40 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                <AlignLeft className="w-3.5 h-3.5" /> Description
              </label>
              <textarea rows={3} placeholder="Task details..." className="w-full bg-slate-900/40 border-2 border-slate-700/50 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none resize-none text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
              <BarChart2 className="w-3.5 h-3.5" /> Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id} type="button" onClick={() => setStatus(opt.id)}
                  className={`py-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${status === opt.id ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-900/30 border-slate-800 text-slate-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            {isEditMode && (
              <button
                type="button" onClick={handleDelete}
                className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit" disabled={isSubmitting || !title.trim()}
              className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};