import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import type { Task, TaskStatus } from '../types';
import { Layout, X, Trash2, Clock, Timer, Hourglass } from 'lucide-react';

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
  const [targetValue, setTargetValue] = useState('2');
  const [targetUnit, setTargetUnit] = useState<'m' | 'h' | 'd'>('h');
  const [now, setNow] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!task;

  useEffect(() => {
    let interval: any;
    if (task?.status === 'inprogress' && task?.activeStartTime) {
      setNow(Date.now());
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [task?.status, task?.activeStartTime]);

  const currentSession = task?.activeStartTime ? Math.max(0, now - new Date(task.activeStartTime).getTime()) : 0;
  const totalMs = (task?.totalTimeSpent || 0) + currentSession;

  useEffect(() => {
    if (!isEditMode) {
      setStatus(defaultStatus);
      setTitle('');
      setDescription('');
      setDueDate('');
      setTargetValue('2');
      setTargetUnit('h');
    }
  }, [defaultStatus, isEditMode]);


useEffect(() => {
  if (task) {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    
    // Choose the best unit for existing duration
    const ms = task.targetDuration || 7200000;
    if (ms >= 86400000 && ms % 86400000 === 0) {
      setTargetValue((ms / 86400000).toString());
      setTargetUnit('d');
    } else if (ms >= 3600000) {
      setTargetValue((ms / 3600000).toString());
      setTargetUnit('h');
    } else {
      setTargetValue((ms / 60000).toString());
      setTargetUnit('m');
    }
    
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setDueDate(localDate.toISOString().slice(0, 16));
    }
  } else {
    setTargetValue('2');
    setTargetUnit('h');
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

  const formatBankedTime = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    parts.push(`${s}s`);

    return parts.join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const isoDueDate = dueDate ? new Date(dueDate).toISOString() : null;
      
      let multiplier = 3600000;
      if (targetUnit === 'm') multiplier = 60000;
      if (targetUnit === 'd') multiplier = 86400000;
      
      const targetDurationMs = parseFloat(targetValue) * multiplier;

      const payload = { 
        title: title.trim(), 
        description: description.trim(), 
        status, 
        dueDate: isoDueDate,
        targetDuration: targetDurationMs 
      };

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
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{isEditMode ? 'Edit Task' : 'New Task'}</h2>
              {isEditMode && totalMs > 0 && (
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Timer className={`w-3 h-3 ${task?.status === 'inprogress' ? 'text-indigo-400 animate-pulse' : ''}`} />
                  {task?.status === 'inprogress' ? 'Clocking: ' : 'Banked: '}
                  {formatBankedTime(totalMs)}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Title & Description */}
          <div className="space-y-4">
            <input required autoFocus placeholder="Task Title" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" rows={2} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none resize-none text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Goal (Timer) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                <Hourglass className="w-3.5 h-3.5 text-indigo-400" /> Goal
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.5"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none" 
                  value={targetValue} 
                  onChange={(e) => setTargetValue(e.target.value)} 
                />
                <select 
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as any)}
                  className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="m">Min</option>
                  <option value="h">Hours</option>
                  <option value="d">Days</option>
                </select>
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-3">
               <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current State</label>
               <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none appearance-none"
               >
                 <option value="todo">To Do</option>
                 <option value="inprogress">In Progress</option>
                 <option value="done">Done</option>
               </select>
            </div>
          </div>

          {/* Deadline Section */}
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