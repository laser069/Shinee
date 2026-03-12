import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { Plus, Loader2, ChevronLeft, Clock, Timer, AlertCircle } from 'lucide-react';
import type { Board, Task, TaskStatus } from '../types';

// --- SUB-COMPONENT: REAL-TIME ANALYTICS ---
const TaskAnalytics: React.FC<{ task: Task }> = ({ task }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let interval: any;
    if (task.status === 'inprogress' && task.activeStartTime) {
      setNow(Date.now());
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [task.status, task.activeStartTime]);

  const currentSession = task.activeStartTime ? Math.max(0, now - new Date(task.activeStartTime).getTime()) : 0;
  const totalMs = (task.totalTimeSpent || 0) + currentSession;
  
  const hasTarget = !!task.targetDuration && task.targetDuration > 0;
  const target = task.targetDuration || 0;
  const progress = hasTarget ? Math.min(100, (totalMs / target) * 100) : 0;
  
  const timeRemainingInGoal = hasTarget ? Math.max(0, target - totalMs) : 0;
  const overGoal = hasTarget ? totalMs > target : false;
  
  const projectedFinish = now + timeRemainingInGoal;
  const isInDebt = task.dueDate ? projectedFinish > new Date(task.dueDate).getTime() : false;

  const format = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    if (d === 0) parts.push(`${s}s`); // Hide seconds if showing days

    return parts.join(' ');
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
            {hasTarget ? (overGoal ? 'Over Goal' : 'Goal Countdown') : 'Stopwatch'}
          </span>
          <div className="flex items-center gap-1.5">
            <Timer className={`w-3.5 h-3.5 ${task.status === 'inprogress' ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />
            <span className={`text-xs font-mono font-bold ${
              task.status === 'inprogress' 
                ? (overGoal ? 'text-red-400' : 'text-indigo-400') 
                : 'text-slate-500'
            }`}>
              {hasTarget 
                ? format(overGoal ? totalMs - target : timeRemainingInGoal)
                : format(totalMs)
              }
            </span>
          </div>
        </div>
        
        {isInDebt && task.status !== 'done' && (
          <div className="flex flex-col items-end gap-0.5 group">
            <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Time Debt</span>
            <AlertCircle className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
          </div>
        )}
      </div>

      {hasTarget && (
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 relative ${
              overGoal ? 'bg-red-500' : isInDebt ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
            }`}
            style={{ width: `${progress}%` }}
          >
            {task.status === 'inprogress' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: DEADLINE COUNTDOWN ---
const DeadlineCountdown: React.FC<{ dueDate: string; status: TaskStatus }> = ({ dueDate, status }) => {
  const [text, setText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(dueDate).getTime() - Date.now();
      if (diff < 0) {
        setText('Past Due');
        setIsUrgent(status !== 'done');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(hours / 24);

      if (days > 0) setText(`${days}d left`);
      else if (hours > 0) setText(`${hours}h left`);
      else setText(`${Math.floor(diff / 60000)}m left`);
      
      setIsUrgent(hours < 12 && status !== 'done');
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dueDate, status]);

  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${
      isUrgent ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
    }`}>
      <Clock className="w-2.5 h-2.5" />
      {text}
    </div>
  );
};

// --- MAIN BOARD PAGE ---
const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
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

    // 1. Optimistic UI update (including timer kickstart)
    setTasks(prev => prev.map(t => {
      if (t._id === draggableId) {
        const updated = { ...t, status: newStatus };
        if (newStatus === 'inprogress' && t.status !== 'inprogress') {
          updated.activeStartTime = new Date().toISOString();
        } else if (t.status === 'inprogress' && newStatus !== 'inprogress') {
          updated.activeStartTime = null; // Backend will fix totalTimeSpent
        }
        return updated;
      }
      return t;
    }));

    try {
      // 2. Sync with Backend (returns recalculated time fields)
      const response = await taskService.updateTask(draggableId, { status: newStatus });
      
      // 3. Update the task with the real server-side timestamps
      setTasks(prev => prev.map(t => t._id === draggableId ? response : t));
    } catch (err) {
      setTasks(oldTasks); // Rollback on error
    }
  };

  const handleOpenCreate = (status: TaskStatus) => {
    setSelectedTask(null);
    setActiveStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
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
          <h1 className="text-xl font-semibold text-white tracking-tight">{board?.title}</h1>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 px-8 pb-8 flex-1 overflow-x-auto">
          {columns.map(column => (
            <div key={column.id} className="w-80 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {column.label}
                </span>
                <button 
                  onClick={() => handleOpenCreate(column.id)} 
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
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
                            onDoubleClick={(e) => handleOpenEdit(e, task)}
                            className={`bg-[#161b26] border border-slate-800/40 p-4 rounded-2xl mb-3 cursor-pointer hover:border-indigo-500/50 transition-all ${
                              snapshot.isDragging ? 'shadow-2xl ring-1 ring-indigo-500 bg-[#1c2331]' : 'hover:translate-y-[-2px]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h4 className="text-[13px] font-bold text-slate-100 leading-tight flex-1">{task.title}</h4>
                              {task.dueDate && <DeadlineCountdown dueDate={task.dueDate} status={task.status} />}
                            </div>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                            
                            {/* THE ANALYTICS ENGINE */}
                            <TaskAnalytics task={task} />
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