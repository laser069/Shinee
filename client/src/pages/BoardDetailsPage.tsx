import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import boardService from '../services/boardService';
import taskService from '../services/taskService';
import { TaskModal } from '../components/TaskModal'; // Create this next
import type { Board, Task, TaskStatus } from '../lib/apiClient';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (id) fetchBoardDetails();
  }, [id]);

  const fetchBoardDetails = async () => {
    try {
      const [boardData, boardTasks] = await Promise.all([
        boardService.getBoardById(id!),
        taskService.getTasks(id),  // Pass boardId to filter on server
      ]);
      setBoard(boardData);
      setTasks(boardTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (status: TaskStatus) => {
    setActiveStatus(status);
    setIsModalOpen(true);
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      fetchBoardDetails();
    } catch (err) {
      alert("Move failed");
    }
  };

  if (loading) return <div className="p-10 text-white">Loading board...</div>;
  if (!board) return <div className="p-10 text-white">Board not found</div>;

  const columns: TaskStatus[] = ['todo', 'inprogress', 'done'];

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{board.title}</h1>
          <p className="text-slate-500 text-sm mt-1">Double-click a column to add a task there</p>
        </div>
        <button 
          onClick={() => openModal('todo')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          + Add New Task
        </button>
      </header>

      <div className="flex gap-6 flex-1 overflow-x-auto pb-6">
        {columns.map(status => (
          <div 
            key={status} 
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 w-80 flex-shrink-0 flex flex-col group transition-colors hover:border-slate-700"
            onDoubleClick={() => openModal(status)} // Triggered on double click
          >
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="font-bold text-slate-400 uppercase text-xs tracking-[0.2em]">{status}</h3>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded-md font-bold">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              {tasks
                .filter(t => t.status === status)
                .map(task => (
                  <div key={task._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm hover:border-indigo-500/50 transition-all cursor-default group/card">
                    <h4 className="font-bold text-white mb-1">{task.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                    
                    <div className="mt-4 flex justify-between items-center">
                       {status !== 'done' ? (
                         <button 
                           onClick={() => moveTask(task._id, status === 'todo' ? 'inprogress' : 'done')}
                           className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                         >
                           Move to {status === 'todo' ? 'In Progress' : 'Done'} →
                         </button>
                       ) : <span className="text-[10px] text-green-500 font-bold uppercase">Completed</span>}
                    </div>
                  </div>
                ))}
                
                {/* Visual cue for double click */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center py-2">
                   <p className="text-[10px] text-slate-600 italic">Double-click to add</p>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal Popup */}
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