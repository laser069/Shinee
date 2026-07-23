import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Layout, CheckSquare, Repeat as HabitIcon } from 'lucide-react';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import habitService from '../services/habitService';
import { useAuth } from '../context/AuthContext';
import type { Board, Task, Habit } from '../types';

type ResultItem =
  | { kind: 'board'; id: string; label: string; data: Board }
  | { kind: 'task'; id: string; label: string; data: Task }
  | { kind: 'habit'; id: string; label: string; data: Habit };

export const CommandPalette: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [boardData, taskData, habitData] = await Promise.all([
        boardService.getBoards(),
        taskService.getTasks(),
        habitService.getHabitsDashboard(),
      ]);
      setBoards(boardData);
      setTasks(taskData);
      setHabits(habitData.map(d => d.habit));
    } finally {
      setLoading(false);
    }
  }, []);

  const openPalette = useCallback(() => {
    if (!isAuthenticated) return;
    setIsOpen(true);
    setQuery('');
    setActiveIndex(0);
    loadData();
  }, [isAuthenticated, loadData]);

  const closePalette = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => {
          if (prev) return false;
          openPalette();
          return true;
        });
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleOpenEvent = () => openPalette();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, [openPalette]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();
  const matches = (text: string) => q.length === 0 || text.toLowerCase().includes(q);

  const results: ResultItem[] = [
    ...boards.filter(b => matches(b.title)).map((b): ResultItem => ({ kind: 'board', id: b._id, label: b.title, data: b })),
    ...tasks.filter(t => matches(t.title)).map((t): ResultItem => ({ kind: 'task', id: t._id, label: t.title, data: t })),
    ...habits.filter(h => matches(h.name)).map((h): ResultItem => ({ kind: 'habit', id: h._id, label: h.name, data: h })),
  ].slice(0, 30);

  const handleSelect = (item: ResultItem) => {
    if (item.kind === 'board') {
      navigate(`/board/${item.id}`);
    } else if (item.kind === 'task') {
      navigate(`/board/${item.data.boardId}`, { state: { openTaskId: item.id } });
    } else {
      navigate('/habits');
    }
    closePalette();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) handleSelect(results[activeIndex]);
    }
  };

  if (!isOpen) return null;

  const iconFor = (kind: ResultItem['kind']) => {
    if (kind === 'board') return <Layout className="w-4 h-4" />;
    if (kind === 'task') return <CheckSquare className="w-4 h-4" />;
    return <HabitIcon className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 p-4">
      <div className="absolute inset-0 bg-[#0A0A0A]/80" onClick={closePalette} />
      <div className="relative bg-white border-4 border-[#0A0A0A] w-full max-w-xl rounded-[2rem] shadow-[16px_16px_0px_0px_rgba(10,10,10,1)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b-4 border-[#0A0A0A]">
          <Search className="w-5 h-5 text-[#0A0A0A]/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search boards, tasks, habits..."
            className="flex-1 outline-none font-bold text-[#0A0A0A] placeholder:text-[#0A0A0A]/30"
          />
          <button onClick={closePalette} className="text-[#0A0A0A] hover:text-[#F5C842]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && <div className="p-6 text-center text-xs font-black uppercase tracking-widest text-[#0A0A0A]/40">Loading...</div>}
          {!loading && results.length === 0 && (
            <div className="p-6 text-center text-xs font-black uppercase tracking-widest text-[#0A0A0A]/40">No results</div>
          )}
          {!loading && results.map((item, index) => (
            <button
              key={`${item.kind}-${item.id}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                index === activeIndex ? 'bg-[#F5C842]/20' : 'hover:bg-[#0A0A0A]/5'
              }`}
            >
              {iconFor(item.kind)}
              <span className="flex-1 font-bold text-sm text-[#0A0A0A] truncate">{item.label}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/30">{item.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
