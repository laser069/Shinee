import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import type { Task, TaskStatus, Tag, Subtask } from '../types';
import { TAG_COLORS } from '../types';
import { Layout, X, Trash2, Clock, Timer, Hourglass, Tag as TagIcon } from 'lucide-react';
import { TagChip } from './TagChip';
import { SubtaskList } from './SubtaskList';

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
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState<'m' | 'h' | 'd'>('h');
  const [now, setNow] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLORS[0]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

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
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);

      const ms = task.targetDuration;
      if (ms) {
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
      } else {
        setTargetValue('');
        setTargetUnit('h');
      }
      
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setDueDate(localDate.toISOString().slice(0, 16));
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setTargetValue('');
      setTargetUnit('h');
      setDueDate('');
      setTags([]);
      setSubtasks([]);
    }
  }, [task, defaultStatus]);

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some(t => t.name === name && t.color === newTagColor)) {
      setNewTagName('');
      return;
    }
    setTags(prev => [...prev, { name, color: newTagColor }]);
    setNewTagName('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickDate = (hours = 0, days = 0) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    d.setDate(d.getDate() + days);
    setDueDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const formatBankedTime = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const parts = [];
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
      let mult = 3600000;
      if (targetUnit === 'm') mult = 60000;
      if (targetUnit === 'd') mult = 86400000;
      const targetDurationMs = targetValue ? parseFloat(targetValue) * mult : 0;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        targetDuration: targetDurationMs,
        tags,
        subtasks,
      };

      if (isEditMode && task) await taskService.updateTask(task._id, payload);
      else await taskService.createTask({ ...payload, boardId });
      
      onSuccess();
      onClose();
    } catch (err) {
      alert("Save failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0A0A0A]/80" onClick={onClose} />
      <div className="relative bg-white border-4 border-[#0A0A0A] w-full max-w-lg rounded-[2.5rem] shadow-[16px_16px_0px_0px_rgba(10,10,10,1)] overflow-hidden animate-in zoom-in duration-200">
        <header className="px-8 py-8 flex items-center justify-between border-b-4 border-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-[#0A0A0A] text-white`}>
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter uppercase">{isEditMode ? 'Modify' : 'Draft'} Task</h2>
              {isEditMode && totalMs > 0 && (
                <p className="text-[10px] text-[#0A0A0A]/40 font-black uppercase flex items-center gap-1 mt-0.5">
                  <Timer className={`w-3.5 h-3.5 ${task?.status === 'inprogress' ? 'text-[#F5C842] animate-pulse' : ''}`} />
                  {task?.status === 'inprogress' ? 'Clocking: ' : 'Banked: '} {formatBankedTime(totalMs)}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#0A0A0A] hover:text-[#F5C842] transition-colors"><X size={32} strokeWidth={3} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-4">
            <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-widest px-1">Concept & Title</label>
            <input required autoFocus placeholder="What needs doing?" className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="The finer details..." rows={2} className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none resize-none font-bold" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest px-1">
                <Hourglass className="w-4 h-4 text-[#F5C842]" /> 
                Allocated Time
              </label>
              <div className="flex gap-2">
                <input type="number" step="any" placeholder="0" className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] outline-none font-black" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
                <select value={targetUnit} onChange={(e) => setTargetUnit(e.target.value as any)} className="bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] outline-none cursor-pointer font-black appearance-none">
                  <option value="m">M</option>
                  <option value="h">H</option>
                  <option value="d">D</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
               <label className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest px-1">Workflow State</label>
               <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] outline-none font-black cursor-pointer appearance-none">
                 <option value="todo">BACKLOG</option>
                 <option value="inprogress">ACTIVE</option>
                 <option value="done">RESOLVED</option>
               </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest px-1"><Clock className="w-4 h-4 text-[#F5C842]" /> Hard Deadline</label>
            <input type="datetime-local" className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl p-4 text-[#0A0A0A] outline-none font-black [color-scheme:light]" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={() => handleQuickDate(2, 0)} className="flex-1 py-3 rounded-xl bg-white border-4 border-[#0A0A0A] text-xs font-black text-[#0A0A0A] hover:bg-[#F5C842] transition-colors shadow-sm">+ 2H</button>
              <button type="button" onClick={() => handleQuickDate(0, 2)} className="flex-1 py-3 rounded-xl bg-white border-4 border-[#0A0A0A] text-xs font-black text-[#0A0A0A] hover:bg-[#F5C842] transition-colors shadow-sm">+ 2D</button>
              <button type="button" onClick={() => setDueDate('')} className="px-5 py-3 rounded-xl bg-white border-4 border-[#0A0A0A] text-xs font-black text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">X</button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest px-1"><TagIcon className="w-4 h-4 text-[#F5C842]" /> Tags</label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <TagChip key={`${tag.name}-${tag.color}-${i}`} tag={tag} onRemove={() => handleRemoveTag(i)} />
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tag name"
                maxLength={30}
                className="flex-1 bg-white border-4 border-[#0A0A0A] rounded-2xl p-3 text-[#0A0A0A] outline-none font-bold text-sm"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              />
              <button type="button" onClick={handleAddTag} className="px-5 py-3 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all">Add</button>
            </div>
            <div className="flex gap-2">
              {TAG_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newTagColor === color ? 'border-[#0A0A0A] scale-110' : 'border-[#0A0A0A]/20'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <SubtaskList subtasks={subtasks} onChange={setSubtasks} />

          <div className="flex gap-4 pt-4">
            {isEditMode && (
              <button type="button" onClick={async () => { if(window.confirm("Archive this task permanently?")) { await taskService.deleteTask(task._id); onSuccess(); onClose(); } }} className="p-4 bg-white border-4 border-rose-500 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-md"><Trash2 className="w-6 h-6" /></button>
            )}
            <button type="submit" disabled={isSubmitting} className="flex-1 p-4 bg-[#0A0A0A] text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all shadow-lg active:scale-95">
              {isSubmitting ? 'Syncing...' : 'Finalize Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};