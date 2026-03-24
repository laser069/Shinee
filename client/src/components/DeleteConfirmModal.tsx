import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  habitName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/80 p-4">
      <div className="bg-white border-4 border-[#0A0A0A] w-full max-w-md rounded-3xl shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-red-500" strokeWidth={3} />
          </div>
          
          <h2 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tighter mb-2">
            Delete Habit?
          </h2>
          
          <p className="text-sm text-[#0A0A0A]/60 font-medium mb-8">
            Are you sure you want to delete <span className="font-black text-[#0A0A0A]">"{habitName}"</span>? 
            This action cannot be undone and all progress will be lost.
          </p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-4 border-4 border-[#0A0A0A] text-[#0A0A0A] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#0A0A0A]/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
