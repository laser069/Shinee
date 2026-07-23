import React from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { CalendarDayCell } from './CalendarDayCell';
import type { Task, Habit } from '../../types';

interface CalendarGridProps {
  monthDate: Date;
  tasks: Task[];
  fixedHabits: Habit[];
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDateKey: string) => void;
}

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// fixedDays convention: 0=Mon..6=Sun (per Habit model), JS getDay(): 0=Sun..6=Sat
const jsWeekdayToFixedDay = (jsDay: number) => (jsDay === 0 ? 6 : jsDay - 1);

const buildMonthGrid = (monthDate: Date): Date[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = jsWeekdayToFixedDay(firstOfMonth.getDay());
  const gridStart = new Date(year, month, 1 - startOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({ monthDate, tasks, fixedHabits, onTaskClick, onTaskDrop }) => {
  const days = buildMonthGrid(monthDate);

  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const key = new Date(task.dueDate).toISOString().slice(0, 10);
    if (!tasksByDate.has(key)) tasksByDate.set(key, []);
    tasksByDate.get(key)!.push(task);
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    onTaskDrop(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-7 gap-px bg-[#0A0A0A]/10 border-2 border-[#0A0A0A]/10">
        {DAY_LABELS.map(label => (
          <div key={label} className="bg-white text-center py-2 text-[10px] font-black tracking-widest text-[#0A0A0A]/50">
            {label}
          </div>
        ))}
        {days.map(day => {
          const dateKey = day.toISOString().slice(0, 10);
          const fixedDay = jsWeekdayToFixedDay(day.getDay());
          const habitDots = fixedHabits
            .filter(h => h.fixedDays.includes(fixedDay))
            .map(h => ({ id: h._id, color: h.color, name: h.name }));

          return (
            <CalendarDayCell
              key={dateKey}
              date={day}
              isCurrentMonth={day.getMonth() === monthDate.getMonth()}
              tasks={tasksByDate.get(dateKey) || []}
              habitDots={habitDots}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
