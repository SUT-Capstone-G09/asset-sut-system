import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface AdminRequestFiltersProps {
  currentTab: 'requests' | 'inquiries';
  setCurrentTab: (tab: 'requests' | 'inquiries') => void;
  inquirySubTab: string;
  setInquirySubTab: (subTab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  inquiriesCount: number;
}

const FilterSelect = ({ label }: { label: string }) => (
  <div className="bg-white border rounded-md px-4 py-2 text-sm font-bold text-slate-600 flex items-center cursor-pointer hover:bg-slate-50 shadow-sm">
    {label} <ChevronDown size={16} className="ml-2 text-slate-400" />
  </div>
);

export const AdminRequestFilters: React.FC<AdminRequestFiltersProps> = ({
  currentTab,
  setCurrentTab,
  inquirySubTab,
  setInquirySubTab,
  searchTerm,
  setSearchTerm,
  inquiriesCount,
}) => {
  return (
    <>
      {/* 📍 แถบแท็บหลักสลับการทำงาน (Tabs Bar) */}
      <div className="flex border-b border-slate-200 mb-6">
        <div className="flex flex-wrap">
          <button
            onClick={() => setCurrentTab('requests')}
            className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors border-b-2 ${
              currentTab === 'requests'
                ? 'border-[#E9652B] text-[#E9652B]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            รายการคำร้องแจ้งซ่อมทั้งหมด
          </button>
          <button
            onClick={() => setCurrentTab('inquiries')}
            className={`flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors border-b-2 ${
              currentTab === 'inquiries'
                ? 'border-[#E9652B] text-[#E9652B]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ข้อความติดต่อสอบถาม
            {inquiriesCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E9652B] px-1.5 text-[10px] font-bold text-white ml-1.5">
                {inquiriesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🛠️ ช่องค้นหา ตัวกรอง และฟิลเตอร์ย่อย */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center shadow-sm">
          <Search size={18} className="text-slate-400 mr-3" />
          <input
            type="text"
            placeholder={
              currentTab === 'requests'
                ? 'ค้นหาคำร้องด้วยรหัส, ชื่อหัวเรื่อง, ผู้แจ้ง, สถานที่...'
                : 'ค้นหาอีเมล, ชื่อ, หัวข้อติดต่อ...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm w-full outline-none font-medium text-slate-700"
          />
        </div>
        
        {currentTab === 'requests' && (
          <div className="flex gap-2">
            <FilterSelect label="ประเภทคำร้อง" />
            <FilterSelect label="สถานะ" />
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-md text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]">
              <SlidersHorizontal size={14} /> กรองข้อมูลเพิ่มเติม
            </button>
          </div>
        )}

        {/* ฟิลเตอร์ย่อยสำหรับแท็บข้อความติดต่อสอบถาม */}
        {currentTab === 'inquiries' && (
          <div className="flex space-x-1 bg-slate-50 p-1 rounded-md border border-slate-100 shrink-0">
            <button
              onClick={() => setInquirySubTab('unread')}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inquirySubTab === 'unread'
                  ? 'bg-white text-orange-500 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ยังไม่ได้ตอบกลับ
            </button>
            <button
              onClick={() => setInquirySubTab('replied')}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inquirySubTab === 'replied'
                  ? 'bg-white text-green-600 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ตอบกลับแล้ว
            </button>
          </div>
        )}
      </div>
    </>
  );
};
