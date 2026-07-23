import React, { useMemo } from 'react';
import type { Tag, Task } from '../types';
import { TagChip } from './TagChip';

interface TagFilterBarProps {
  tasks: Task[];
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const tagKey = (tag: Tag) => `${tag.name}::${tag.color}`;

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ tasks, selectedTags, onChange }) => {
  const availableTags = useMemo(() => {
    const seen = new Map<string, Tag>();
    tasks.forEach(task => {
      (task.tags || []).forEach(tag => {
        seen.set(tagKey(tag), tag);
      });
    });
    return Array.from(seen.values());
  }, [tasks]);

  if (availableTags.length === 0) return null;

  const selectedKeys = new Set(selectedTags.map(tagKey));

  const toggleTag = (tag: Tag) => {
    const key = tagKey(tag);
    if (selectedKeys.has(key)) {
      onChange(selectedTags.filter(t => tagKey(t) !== key));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap px-2">
      {availableTags.map(tag => (
        <TagChip
          key={tagKey(tag)}
          tag={tag}
          active={selectedKeys.size === 0 || selectedKeys.has(tagKey(tag))}
          onClick={() => toggleTag(tag)}
        />
      ))}
      {selectedKeys.size > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40 hover:text-[#0A0A0A] px-2"
        >
          Clear
        </button>
      )}
    </div>
  );
};
