import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';

import type { Board, Task, TaskStatus } from '../lib/apiClient';
import type { DropResult } from '@hello-pangea/dnd';
const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (id) fetchBoardDetails();
  }, [id]);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const boardData = await boardService.getBoardById(id!);
      setBoard(boardData);
      
      // The backend populates tasks, so we can cast boardData.tasks to Task[]
      // We also ensure we're only setting tasks that belong to this board
      const boardTasks = (boardData.tasks as unknown as Task[]) || [];
      // Sort tasks by createdAt (newest first)
      const sortedTasks = [...boardTasks].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setTasks(sortedTasks);
    } catch (err) {
      console.error('Error fetching board details:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const originalTasks = [...tasks];
    
    // Optimistic Update
    const updatedTasks = tasks.map(task => 
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(draggableId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert("Failed to sync move to server. Rolling back...");
      setTasks(originalTasks);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#0f172a]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-xl font-medium">Loading board...</p>
    </div>
  );

  if (!board) return (
    <div className="flex items-center justify-center h-full text-white bg-[#0f172a]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Board not found</h2>
        <p className="text-slate-400">The board you're looking for might have been deleted.</p>
      </div>
    </div>
  );

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-500' },
    { id: 'inprogress', label: 'In Progress', color: 'bg-amber-500' },
    { id: 'done', label: 'Done', color: 'bg-emerald-500' }
  ];

  return (
    <div className="h-full flex flex-col bg-[#0f172a] overflow-hidden">
      <header className="flex justify-between items-center px-8 py-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{board.title}</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Workspace
          </p>
        </div>
        <button 
          onClick={() => { setActiveStatus('todo'); setIsModalOpen(true); }} 
          className="bg-indigo-600 hover:bg-indigo-500 transition-all px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> New Task
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 flex-1 overflow-x-auto px-8 pb-8 scrollbar-hide">
          {columns.map(column => (
            <div key={column.id} className="w-85 flex flex-col flex-shrink-0 h-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${column.color}`} />
                   <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{column.label}</h3>
                </div>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-2xl p-3 transition-all duration-300 overflow-y-auto overflow-x-hidden scrollbar-hide ${
                      snapshot.isDraggingOver 
                        ? 'bg-slate-800/60 border-2 border-dashed border-indigo-500/40 ring-4 ring-indigo-500/5' 
                        : 'bg-slate-900/40 border-2 border-transparent'
                    }`}
                    style={{ minHeight: '100px' }}
                    onDoubleClick={() => { setActiveStatus(column.id); setIsModalOpen(true); }}
                  >
                    <div className="flex flex-col gap-4">
                      {tasks
                        .filter(t => t.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={`bg-slate-800 border p-4 rounded-xl shadow-lg transition-all group hover:border-indigo-500/50 ${
                                  snapshot.isDragging 
                                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105 rotate-1 z-50' 
                                    : 'border-slate-700/50'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase text-sm tracking-wide">{task.title}</h4>
                                  <div className={`w-2 h-2 rounded-full ${
                                    task.status === 'done' ? 'bg-emerald-500' : 
                                    task.status === 'inprogress' ? 'bg-amber-500' : 'bg-slate-500'
                                  }`} />
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{task.description}</p>
                                
                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-700/50 text-[11px] text-slate-500 font-medium">
                                  <div className="flex items-center gap-2">
                                     <span className="opacity-40">#{task._id.slice(-4)}</span>
                                     <span>{new Date(task.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10" title="Assigned to you">
                                      {/* Using first letter of app name if user not detailed, or just a placeholder 'J' for Doe? 
                                          Actually let's just use a sleek user icon if we don't have the name per task */}
                                      {/* We have the global user in context, let's use that if we can. 
                                          For now let's just use the first letter of 'Nexus' or stay with a cleaner 'U' for User */}
                                      U
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <TaskModal 
          boardId={id!} 
          defaultStatus={activeStatus} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchBoardDetails} 
        />
      )}
    </div>
  );
};

export default BoardPage;