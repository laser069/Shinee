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
      const [boardData, boardTasks] = await Promise.all([
        boardService.getBoardById(id!),
        taskService.getTasks(id!), // Fetch tasks specifically for this board
      ]);
      setBoard(boardData);
      setTasks(boardTasks);
    } catch (err) {
      console.error('Error fetching board details:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 1. If dropped outside a list or in the same spot, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // 2. Optimistic UI Update
    // We update the local state immediately so the drag feels snappy
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(task => 
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks);

    // 3. Persist to Backend
    try {
      await taskService.updateTask(draggableId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert("Failed to sync move to server. Rolling back...");
      setTasks(originalTasks); // Rollback on error
    }
  };

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-xl font-medium">Loading board...</p>
    </div>
  );

  if (!board) return <div className="p-10 text-white text-center">Board not found</div>;

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{board.title}</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your tasks and track progress</p>
        </div>
        <button 
          onClick={() => { setActiveStatus('todo'); setIsModalOpen(true); }} 
          className="bg-indigo-600 hover:bg-indigo-500 transition-all px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Task
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 flex-1 overflow-x-auto pb-6 scrollbar-hide">
          {columns.map(column => (
            <div key={column.id} className="w-85 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">{column.label}</h3>
                <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-2xl p-3 transition-all duration-300 min-h-[500px] ${
                      snapshot.isDraggingOver 
                        ? 'bg-slate-800/60 border-2 border-dashed border-indigo-500/40 ring-4 ring-indigo-500/5' 
                        : 'bg-slate-900/40 border-2 border-transparent'
                    }`}
                    onDoubleClick={() => { setActiveStatus(column.id); setIsModalOpen(true); }}
                  >
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
                              className={`bg-slate-800 border p-4 rounded-xl shadow-lg mb-4 transition-all group hover:border-indigo-500/50 ${
                                snapshot.isDragging 
                                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105 rotate-2 z-50' 
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
                              
                              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <span className="text-[10px] text-slate-500 font-medium">#{task._id.slice(-4)}</span>
                                <div className="flex -space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                                    U
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
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