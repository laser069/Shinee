import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import notificationService from '../services/notificationService';
import type { NotificationItem } from '../types';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export const NotificationBell: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = () => {
      notificationService
        .getUpcoming(24)
        .then((data) => {
          if (!cancelled) setItems(data);
        })
        .catch((err) => {
          console.error('Error fetching notifications:', err);
        });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: NotificationItem) => {
    setIsOpen(false);
    navigate(`/board/${item.boardId}`, { state: { openTaskId: item.taskId } });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 text-[#0A0A0A] hover:text-[#F5C842] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-4 border-[#0A0A0A] rounded-2xl shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b-4 border-[#0A0A0A] text-xs font-black uppercase tracking-widest">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-6 text-center text-xs font-black uppercase tracking-widest text-[#0A0A0A]/40">All clear</div>
            )}
            {items.map(item => (
              <button
                key={item.taskId}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 border-b-2 border-[#0A0A0A]/10 hover:bg-[#F5C842]/10 transition-colors"
              >
                <p className="font-bold text-sm text-[#0A0A0A] truncate">{item.title}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${item.overdue ? 'text-rose-500' : 'text-[#0A0A0A]/40'}`}>
                  {item.overdue ? 'Overdue' : 'Due soon'} — {new Date(item.dueDate).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
