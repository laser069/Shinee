import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { Plus, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import type { Board, Task, TaskStatus } from '../types';
import type { DropResult } from '@hello-pangea/dnd';
const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) fetchBoardDetails();
  }, [id]);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const boardData = await boardService.getBoardById(id!);
      setBoard(boardData);
      const boardTasks = boardData && Array.isArray(boardData.tasks) ? boardData.tasks : [];
      setTasks([...boardTasks].sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ));
    } catch (err) {
      console.error('Error fetching board details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoardDetails(); }, [fetchBoardDetails]);

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newStatus = destination.droppableId as TaskStatus;
    const oldTasks = [...tasks];

    setTasks(prev => prev.map(task => 
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(draggableId, { status: newStatus });
    } catch (err) {
      setTasks(oldTasks);
    }
  };

  const openAddTask = (status: TaskStatus) => {
    setSelectedTask(null); // Clear selection for "Create" mode
    setActiveStatus(status);
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task); // Set task for "Edit" mode
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0b0f1a]"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0b0f1a] text-slate-200">
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white">{board?.title}</h1>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 px-8 pb-8 flex-1 overflow-x-auto">
          {columns.map(column => (
            <div key={column.id} className="w-80 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{column.label}</span>
                <button onClick={() => openAddTask(column.id)} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-indigo-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-2xl p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-900/40' : 'bg-transparent'}`}
                  >
                    {tasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onDoubleClick={() => openEditTask(task)} // TRIGGER EDIT
                            className={`bg-[#161b26] border border-slate-800/40 p-4 rounded-xl mb-3 cursor-pointer hover:border-indigo-500/50 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-1 ring-indigo-500/50' : ''}`}
                          >
                            <h4 className="text-[13px] font-semibold text-slate-200">{task.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{task.description}</p>
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
          task={selectedTask} // Pass task if editing
          defaultStatus={activeStatus} 
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} 
          onSuccess={fetchBoardDetails} 
        />
      )}
    </div>
  );
};

export default BoardPage;