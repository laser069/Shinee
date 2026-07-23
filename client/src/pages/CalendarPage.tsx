import React, { useEffect, useState, useCallback } from 'react';
import taskService from '../services/taskService';
import habitService from '../services/habitService';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { TaskModal } from '../components/TaskModal';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Task, Habit } from '../types';

const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

const CalendarPage: React.FC = () => {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, habitData] = await Promise.all([
        taskService.getTasks(),
        habitService.getHabitsDashboard(),
      ]);
      setTasks(taskData);
      setHabits(habitData.map(d => d.habit));
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fixedHabits = habits.filter(h => h.frequencyType === 'fixed');
  const flexibleHabits = habits.filter(h => h.frequencyType === 'flexible');

  const handleTaskDrop = async (taskId: string, newDateKey: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const oldTasks = [...tasks];
    const existingDate = task.dueDate ? new Date(task.dueDate) : new Date();
    const [year, month, day] = newDateKey.split('-').map(Number);
    const newDate = new Date(existingDate);
    newDate.setFullYear(year, month - 1, day);
    const newDueDate = newDate.toISOString();

    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, dueDate: newDueDate } : t));

    try {
      const response = await taskService.updateTask(taskId, { dueDate: newDueDate });
      setTasks(prev => prev.map(t => t._id === taskId ? response : t));
    } catch {
      setTasks(oldTasks);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const changeMonth = (delta: number) => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  if (loading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#0A0A0A] animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white border-4 border-[#0A0A0A] rounded-xl hover:bg-[#F5C842] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-black uppercase tracking-tight w-48 text-center">{MONTH_LABEL.format(monthDate)}</span>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white border-4 border-[#0A0A0A] rounded-xl hover:bg-[#F5C842] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {flexibleHabits.length > 0 && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">Any-day habits:</span>
          {flexibleHabits.map(h => (
            <span key={h._id} className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#0A0A0A] text-[10px] font-black uppercase" style={{ backgroundColor: h.color, color: '#0A0A0A' }}>
              {h.name}
            </span>
          ))}
        </div>
      )}

      <CalendarGrid
        monthDate={monthDate}
        tasks={tasks}
        fixedHabits={fixedHabits}
        onTaskClick={handleTaskClick}
        onTaskDrop={handleTaskDrop}
      />

      {isModalOpen && selectedTask && (
        <TaskModal
          boardId={selectedTask.boardId}
          task={selectedTask}
          defaultStatus={selectedTask.status}
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default CalendarPage;
