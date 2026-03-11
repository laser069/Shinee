import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import boardService from '../services/boardService';
import { type Board } from '../lib/apiClient';

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
      setBoards([...boards, newBoard]);
      setNewBoardTitle('');
    } catch (error) {
      alert("Error creating board");
    }
  };

  if (loading) return <div className="p-8">Loading your boards...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Boards</h1>
      
      {/* Create Board Form */}
      <form onSubmit={handleCreateBoard} className="mb-10 flex gap-4">
        <input 
          type="text" 
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New board title..."
          className="border p-2 rounded w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Create Board
        </button>
      </form>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boards.map(board => (
          <Link 
            key={board._id} 
            to={`/board/${board._id}`}
            className="block p-6 bg-white border rounded-lg shadow hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
          >
            <h2 className="text-xl font-semibold text-gray-800">{board.title}</h2>
            <p className="text-gray-500 mt-2 text-sm">{board.tasks?.length || 0} Tasks</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;