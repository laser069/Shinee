import React from 'react';
import { X } from 'lucide-react';
import type { Tag } from '../types';

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  active?: boolean;
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({ tag, onRemove, active, onClick }) => {
  const isInteractive = !!onClick;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#0A0A0A] text-[10px] font-black uppercase tracking-widest transition-all ${
        isInteractive ? 'cursor-pointer' : ''
      } ${active === false ? 'opacity-40' : ''}`}
      style={{ backgroundColor: tag.color, color: '#0A0A0A' }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="hover:opacity-60"
        >
          <X className="w-3 h-3" strokeWidth={3} />
        </button>
      )}
    </span>
  );
};
