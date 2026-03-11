import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../services/boardService';
import { type Board } from '../lib/apiClient';
import { Layout, Plus, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (error) {
      console.error("Failed to load boards", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      const newBoard = await boardService.createBoard({ title: newBoardTitle });
      setBoards(prev => [...prev, newBoard]);
      setNewBoardTitle('');
    } catch (error) {
      alert("Error creating board");
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <Layout className="w-8 h-8 text-indigo-500" />
             Workspaces
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your projects and team boards efficiently.</p>
        </div>
        
        <form onSubmit={handleCreateBoard} className="flex gap-2">
          <input 
            type="text" 
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="Name your workspace..."
            className="bg-slate-800 border-2 border-slate-700 p-3 rounded-xl w-64 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500"
          />
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </form>
      </header>
      
      {boards.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-3xl">
           <Layout className="w-16 h-16 text-slate-700 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-white mb-2">No boards found</h2>
           <p className="text-slate-400 mb-8">Ready to start something new? Create your first workspace above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {boards.map(board => (
            <Link 
              key={board._id} 
              to={`/board/${board._id}`}
              className="group relative bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl hover:border-indigo-500/50 transition-all hover:translate-y-[-4px] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Layout className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest bg-slate-900 px-2 py-0.5 rounded">
                  Workspace
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{board.title}</h2>
              
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/30">
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   {board.tasks?.length || 0} Tasks
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                   <Calendar className="w-3.5 h-3.5" />
                   {new Date(board.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;