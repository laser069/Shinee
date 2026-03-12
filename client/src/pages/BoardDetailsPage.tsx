import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { Plus, Loader2, ChevronLeft, Clock } from 'lucide-react';
import type { Board, Task, TaskStatus } from '../types';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchBoardDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const boardData = await boardService.getBoardById(id);
      setBoard(boardData);
      setTasks(boardData?.tasks || []);
    } catch (err) {
      console.error('Error fetching board:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoardDetails(); }, [fetchBoardDetails]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newStatus = destination.droppableId as TaskStatus;
    const oldTasks = [...tasks];

    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await taskService.updateTask(draggableId, { status: newStatus });
    } catch (err) {
      setTasks(oldTasks); // Rollback
    }
  };

  // --- LOGIC FOR TARGETED CREATION ---
  const handleOpenCreate = (status: TaskStatus) => {
    setSelectedTask(null);      // New task mode
    setActiveStatus(status);    // Set the default status (todo/inprogress/done)
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();        // Prevents triggering the column's double-click
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="h-screen bg-[#0b0f1a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0b0f1a] text-slate-200">
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white">{board?.title}</h1>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 px-8 pb-8 flex-1 overflow-x-auto">
          {columns.map(column => (
            <div key={column.id} className="w-80 flex flex-col shrink-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {column.label}
                </span>
                <button 
                  onClick={() => handleOpenCreate(column.id)} 
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-indigo-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    // DOUBLE CLICK ON EMPTY SPACE TO CREATE IN THIS COLUMN
                    onDoubleClick={() => handleOpenCreate(column.id)}
                    className={`flex-1 rounded-2xl p-2 transition-colors min-h-[200px] cursor-cell ${
                      snapshot.isDraggingOver ? 'bg-slate-900/40' : 'bg-transparent'
                    }`}
                  >
                    {tasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            // DOUBLE CLICK ON CARD TO EDIT
                            onDoubleClick={(e) => handleOpenEdit(e, task)}
                            className={`bg-[#161b26] border border-slate-800/40 p-4 rounded-xl mb-3 cursor-pointer hover:border-indigo-500/50 transition-all ${
                              snapshot.isDragging ? 'shadow-2xl ring-1 ring-indigo-500' : ''
                            }`}
                          >
                            <h4 className="text-[13px] font-semibold text-slate-200">{task.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                            
                            {/* Due Date Indicator */}
                            {task.dueDate && (
                              <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase ${
                                task.status !== 'done' && new Date(task.dueDate) < new Date() 
                                  ? 'text-red-400' 
                                  : 'text-slate-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            )}
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

      {/* Shared Task Modal */}
      {isModalOpen && (
        <TaskModal 
          boardId={id!} 
          task={selectedTask} 
          defaultStatus={activeStatus} 
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} 
          onSuccess={fetchBoardDetails} 
        />
      )}
    </div>
  );
};

export default BoardPage;