import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { TagFilterBar } from '../components/TagFilterBar';
import { TagChip } from '../components/TagChip';
import { Plus, Loader2, ChevronLeft, Clock, Timer, AlertCircle, Repeat } from 'lucide-react';
import type { Board, Task, TaskStatus, Tag } from '../types';

// --- SUB-COMPONENT: REAL-TIME ANALYTICS ---
// --- SUB-COMPONENT: REAL-TIME ANALYTICS ---
const TaskAnalytics: React.FC<{ task: Task }> = ({ task }) => {
  const [now, setNow] = useState(Date.now());

  // Only run the interval if the task is actually "inprogress"
  useEffect(() => {
    let interval: any;
    if (task.status === 'inprogress' && task.activeStartTime) {
      setNow(Date.now()); // Immediate sync
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [task.status, task.activeStartTime]);

  // Calculations
  const currentSession = task.activeStartTime 
    ? Math.max(0, now - new Date(task.activeStartTime).getTime()) 
    : 0;
  
  const totalMs = (task.totalTimeSpent || 0) + currentSession;
  
  // STRICTOR LOGIC: No hardcoded defaults (like 7200000). 
  // We use exactly what's in the DB.
  const hasTarget = !!task.targetDuration && task.targetDuration > 0;
  const target = hasTarget ? task.targetDuration : 0;
  
  const progress = hasTarget ? Math.min(100, (totalMs / target) * 100) : 0;
  const timeRemainingInGoal = hasTarget ? Math.max(0, target - totalMs) : 0;
  const overGoal = hasTarget ? totalMs > target : false;
  
  // Predict if we will miss the deadline based on remaining effort
  const projectedFinish = now + timeRemainingInGoal;
  const isInDebt = task.dueDate ? projectedFinish > new Date(task.dueDate).getTime() : false;

  // Helper to format ms into a readable string (e.g., "1h 30m 5s")
  const format = (ms: number) => {
    if (ms < 0) ms = 0;
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    // Only show seconds if the task is less than a day long for UI clarity
    if (d === 0) parts.push(`${s}s`); 

    return parts.join(' ') || '0s';
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-[#0A0A0A]/40 uppercase tracking-widest">
            {hasTarget ? (overGoal ? 'Goal Exceeded' : 'Goal Timer') : 'Session Tracker'}
          </span>
          
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${task.status === 'inprogress' ? 'text-[#0A0A0A] animate-pulse' : 'text-[#0A0A0A]/20'}`} />
            <span className={`text-sm font-black tabular-nums ${
              task.status === 'inprogress' 
                ? (overGoal ? 'text-rose-500' : 'text-[#0A0A0A]') 
                : 'text-[#0A0A0A]/40'
            }`}>
              {hasTarget 
                ? format(overGoal ? totalMs - target : timeRemainingInGoal)
                : format(totalMs)
              }
            </span>
          </div>
        </div>
        
        {isInDebt && task.status !== 'done' && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Time Over</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
        )}
      </div>

      {hasTarget && (
        <div className="h-4 w-full bg-[#0A0A0A]/5 rounded-lg overflow-hidden border-2 border-[#0A0A0A]/10">
          <div 
            className={`h-full transition-all duration-1000 ${
              overGoal 
                ? 'bg-rose-500' 
                : isInDebt 
                  ? 'bg-[#F5C842]' 
                  : 'bg-[#0A0A0A]'
            }`}
            style={{ width: `${progress}%` }}
          />
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
        setText('Expired');
        setIsUrgent(status !== 'done');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(hours / 24);

      if (days > 0) setText(`${days}d`);
      else if (hours > 0) setText(`${hours}h`);
      else setText(`${Math.floor(diff / 60000)}m`);
      
      setIsUrgent(hours < 12 && status !== 'done');
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dueDate, status]);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest ${
      isUrgent ? 'bg-rose-500 border-[#0A0A0A] text-white' : 'bg-white border-[#0A0A0A] text-[#0A0A0A]'
    }`}>
      <Clock className="w-3 h-3" />
      {text}
    </div>
  );
};

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

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

  useEffect(() => {
    const openTaskId = (location.state as { openTaskId?: string } | null)?.openTaskId;
    if (!openTaskId || tasks.length === 0) return;
    const task = tasks.find(t => t._id === openTaskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [tasks, location, navigate]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newStatus = destination.droppableId as TaskStatus;
    const oldTasks = [...tasks];

    setTasks(prev => prev.map(t => {
      if (t._id === draggableId) {
        const updated = { ...t, status: newStatus };
        if (newStatus === 'inprogress' && t.status !== 'inprogress') {
          updated.activeStartTime = new Date().toISOString();
        } else if (t.status === 'inprogress' && newStatus !== 'inprogress') {
          updated.activeStartTime = null;
        }
        return updated;
      }
      return t;
    }));

    try {
      const { task: updatedTask, recurredTask } = await taskService.updateTask(draggableId, { status: newStatus });
      setTasks(prev => {
        const next = prev.map(t => t._id === draggableId ? updatedTask : t);
        return recurredTask ? [...next, recurredTask] : next;
      });
    } catch (err) {
      setTasks(oldTasks);
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
    <div className="h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#0A0A0A] animate-spin" />
    </div>
  );

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'Backlog' },
    { id: 'inprogress', label: 'Active' },
    { id: 'done', label: 'Resolved' }
  ];

  return (
    <div className="h-screen flex flex-col bg-white text-[#0A0A0A]">
      <header className="px-8 py-8 flex items-center justify-between border-b-4 border-[#0A0A0A]">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="p-3 bg-[#0A0A0A] rounded-xl text-white hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tighter uppercase">{board?.title}</h1>
        </div>
      </header>

      <div className="px-8 pt-6">
        <TagFilterBar tasks={tasks} selectedTags={selectedTags} onChange={setSelectedTags} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 px-8 py-10 flex-1 overflow-x-auto bg-[#0A0A0A]/5">
          {columns.map(column => (
            <div key={column.id} className="w-96 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-6 px-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0A0A0A]">{column.label}</span>
                <button onClick={() => handleOpenCreate(column.id)} className="p-2 bg-white border-4 border-[#0A0A0A] rounded-xl text-[#0A0A0A] hover:bg-[#F5C842] transition-colors shadow-md">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} onDoubleClick={() => handleOpenCreate(column.id)} className={`flex-1 transition-colors min-h-[200px] cursor-cell ${snapshot.isDraggingOver ? 'bg-[#F5C842]/10' : ''}`}>
                    {tasks
                      .filter(t => t.status === column.id)
                      .filter(t => selectedTags.length === 0 || (t.tags || []).some(tag => selectedTags.some(sel => sel.name === tag.name && sel.color === tag.color)))
                      .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onDoubleClick={(e) => handleOpenEdit(e, task)} className={`bg-white border-4 border-[#0A0A0A] p-6 rounded-2xl mb-6 cursor-pointer hover:bg-[#F5C842]/5 transition-all shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] ${snapshot.isDragging ? 'rotate-3 scale-105 z-50' : ''}`}>
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <h4 className="text-lg font-black text-[#0A0A0A] leading-tight flex-1 uppercase tracking-tight flex items-center gap-2">
                                {task.recurrence && <Repeat className="w-4 h-4 text-[#F5C842] shrink-0" />}
                                {task.title}
                              </h4>
                              {task.dueDate && <DeadlineCountdown dueDate={task.dueDate} status={task.status} />}
                            </div>
                            <p className="text-sm font-bold text-[#0A0A0A]/60 line-clamp-2 leading-relaxed mb-4">{task.description}</p>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {task.tags.map((tag, i) => <TagChip key={`${tag.name}-${tag.color}-${i}`} tag={tag} />)}
                              </div>
                            )}
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
      {isModalOpen && <TaskModal boardId={id!} task={selectedTask} defaultStatus={activeStatus} onClose={() => { setIsModalOpen(false); setSelectedTask(null); }} onSuccess={fetchBoardDetails} />}
    </div>
  );
};

export default BoardPage;