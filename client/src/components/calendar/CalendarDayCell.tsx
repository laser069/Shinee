import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { Task } from '../../types';

interface CalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  tasks: Task[];
  habitDots: { id: string; color: string; name: string }[];
  onTaskClick: (task: Task) => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ date, isCurrentMonth, tasks, habitDots, onTaskClick }) => {
  const dateKey = date.toISOString().slice(0, 10);
  const isToday = isSameDay(date, new Date());

  return (
    <Droppable droppableId={dateKey}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[110px] border-2 border-[#0A0A0A]/10 p-2 flex flex-col gap-1 transition-colors ${
            isCurrentMonth ? 'bg-white' : 'bg-[#0A0A0A]/5'
          } ${snapshot.isDraggingOver ? 'bg-[#F5C842]/10' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black ${isToday ? 'bg-[#F5C842] px-1.5 rounded-md' : ''} ${isCurrentMonth ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/30'}`}>
              {date.getDate()}
            </span>
            {habitDots.length > 0 && (
              <div className="flex gap-0.5">
                {habitDots.map(h => (
                  <span key={h.id} title={h.name} className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    onClick={() => onTaskClick(task)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-[#0A0A0A] bg-white cursor-pointer truncate ${
                      task.status === 'done' ? 'opacity-40 line-through' : ''
                    } ${dragSnapshot.isDragging ? 'z-50 shadow-lg' : ''}`}
                  >
                    {task.title}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};
