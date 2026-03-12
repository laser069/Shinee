import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

import type { Board, Task, TaskStatus } from '../types';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');

  const fetchBoardDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const boardData = await boardService.getBoardById(id);
      setBoard(boardData);
      
      // Ensure tasks are an array and sorted by creation date
      const boardTasks = boardData && Array.isArray(boardData.tasks) ? boardData.tasks : [];
      const sortedTasks = [...boardTasks].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setTasks(sortedTasks);
    } catch (err) {
      console.error('Error fetching board details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBoardDetails();
  }, [fetchBoardDetails]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Exit if dropped outside or in same spot
    if (!destination || 
       (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const oldTasks = [...tasks];

    // 1. Optimistic Update (Immediate UI feedback)
    setTasks(prev => prev.map(task => 
      task._id === draggableId ? { ...task, status: newStatus } : task
    ));

    try {
      // 2. Sync with Backend
      await taskService.updateTask(draggableId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      // 3. Rollback on failure
      setTasks(oldTasks);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a]">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Loading Workspace...</p>
    </div>
  );

  if (!board) return (
    <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Board not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 block">Return to Dashboard</Link>
      </div>
    </div>
  );

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
    { id: 'inprogress', label: 'In Progress', color: 'bg-amber-400' },
    { id: 'done', label: 'Done', color: 'bg-emerald-400' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] overflow-hidden">
      <header className="flex justify-between items-center px-8 py-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{board.title}</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            Workspace Board
          </p>
        </div>
        <button 
          onClick={() => { setActiveStatus('todo'); setIsModalOpen(true); }} 
          className="bg-indigo-600 hover:bg-indigo-500 transition-all px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          New Task
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 flex-1 overflow-x-auto px-8 pb-8 scrollbar-hide">
          {columns.map(column => (
            <div key={column.id} className="w-80 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${column.color}`} />
                   <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{column.label}</h3>
                </div>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-1 rounded-lg font-black">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-2xl p-2 transition-colors duration-200 overflow-y-auto scrollbar-hide ${
                      snapshot.isDraggingOver ? 'bg-slate-800/40 ring-2 ring-indigo-500/20' : 'bg-slate-900/20'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {tasks
                        .filter(t => t.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-slate-800 border p-4 rounded-xl shadow-md transition-all ${
                                  snapshot.isDragging 
                                    ? 'border-indigo-500 z-50 scale-105 shadow-2xl ring-4 ring-indigo-500/10' 
                                    : 'border-slate-700/50 hover:border-slate-600'
                                }`}
                              >
                                <h4 className="font-bold text-slate-100 text-sm mb-1">{task.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-700/50">
                                   <span className="text-[10px] text-slate-500 font-mono">#{task._id.slice(-4)}</span>
                                   <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">U</div>
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