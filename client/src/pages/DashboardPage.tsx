import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../services/boardService';
import { type Board } from '../types';
import { Layout, Plus, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await boardService.getBoards();
      // Even with the service guard, we double-check here
      setBoards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load boards", error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      const newBoard = await boardService.createBoard({ title: newBoardTitle });
      if (newBoard) {
        setBoards(prev => [...prev, newBoard]);
        setNewBoardTitle('');
      }
    } catch (error) {
      console.error("Error creating board", error);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  // Safety check for rendering
  const safeBoards = Array.isArray(boards) ? boards : [];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <Layout className="w-8 h-8 text-indigo-500" />
             Workspaces
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Your centralized project hubs.</p>
        </div>
        
        <form onSubmit={handleCreateBoard} className="flex gap-2">
          <input 
            type="text" 
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="New workspace name..."
            className="bg-slate-800 border-2 border-slate-700 p-3 rounded-xl w-64 text-white focus:border-indigo-500 outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={!newBoardTitle.trim()}
            className="bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </form>
      </header>
      
      {safeBoards.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl">
           <Layout className="w-16 h-16 text-slate-700 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-slate-400">No workspaces found</h2>
           <p className="text-slate-500">Create a board to start managing tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeBoards.map(board => (
            <Link 
              key={board._id} 
              to={`/board/${board._id}`}
              className="group relative bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:border-indigo-500/50 transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Layout className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-4">{board.title}</h2>
              
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;