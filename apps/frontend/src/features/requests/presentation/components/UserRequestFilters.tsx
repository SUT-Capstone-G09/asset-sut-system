import React from 'react';
import { Search, Wrench, MessageSquareText } from 'lucide-react';

interface UserRequestFiltersProps {
  activeTab: 'all' | 'requests' | 'inquiries';
  setActiveTab: (tab: 'all' | 'requests' | 'inquiries') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  counts: { all: number; requests: number; inquiries: number };
}

export const UserRequestFilters: React.FC<UserRequestFiltersProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  counts,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 border-b border-slate-200 mb-6">
      {/* Tabs */}
      <div className="flex flex-wrap">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-[#E9652B] text-[#E9652B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ทั้งหมด ({counts.all})
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'requests'
              ? 'border-[#E9652B] text-[#E9652B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench size={14} className="mr-1" /> คำร้องซ่อม ({counts.requests})
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'inquiries'
              ? 'border-[#E9652B] text-[#E9652B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquareText size={14} className="mr-1" /> ข้อความสอบถาม ({counts.inquiries})
        </button>
      </div>

      {/* ช่องค้นหาข้อมูลแบบพิมพ์คีย์เวิร์ด */}
      <div className="relative w-full md:w-80 pb-2 md:pb-1 md:ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="ค้นหาเลขที่, หัวข้อเรื่อง..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-[7px] py-2 pl-10 pr-4 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-medium text-slate-700"
        />
      </div>
    </div>
  );
};
