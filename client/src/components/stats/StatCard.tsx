import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, suffix }) => {
  return (
    <div className="px-6 py-5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
        <Icon size={12} className="text-[#F5C842]" />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-black text-[#0A0A0A]">{value}</span>
        {suffix && <span className="text-[10px] text-[#0A0A0A]/60 font-black uppercase">{suffix}</span>}
      </div>
    </div>
  );
};

export default StatCard;
