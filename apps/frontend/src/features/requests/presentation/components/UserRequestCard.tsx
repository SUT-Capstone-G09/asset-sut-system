import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { DashboardItem } from '../../domain/entities/dashboard-item.entity';

interface UserRequestCardProps {
  item: DashboardItem;
}

export const UserRequestCard: React.FC<UserRequestCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-md p-8 shadow-sm relative transition-all duration-200 hover:shadow-md hover:border-orange-100">
      {/* Card Top Section */}
      <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
        <div>
          <span className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-1">
            {item.type === 'requests' ? 'Asset Request' : 'Inquiry Context'}
          </span>
          <h4 className="text-2xl font-black text-slate-700">{item.id}</h4>
        </div>
        <div className={`px-4 py-1.5 rounded-md text-xs font-bold border flex items-center ${item.statusClass}`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${item.status === 'InProgress' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
          {item.statusLabel}
        </div>
      </div>

      {/* Subject Header (สำหรับข้อความสอบถาม) */}
      {item.subject && (
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">เรื่องที่สอบถาม</span>
          <h5 className="text-base font-extrabold text-slate-800">{item.subject}</h5>
        </div>
      )}

      {/* 3-Column Info Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50/60 p-4 rounded-[7px] border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">หมวดหมู่รายการ</p>
          <p className="text-slate-700 font-bold text-xs">{item.category}</p>
        </div>
        <div className="bg-slate-50/60 p-4 rounded-[7px] border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">วันที่บันทึกระบบ</p>
          <p className="text-slate-700 font-bold text-xs">{item.date}</p>
        </div>
        <div className="bg-slate-50/60 p-4 rounded-[7px] border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">สถานที่อ้างอิง</p>
          <p className="text-slate-700 font-bold text-xs">{item.location}</p>
        </div>
      </div>

      {/* Description Body */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <FileText size={14} className="mr-1.5 text-slate-300" /> รายละเอียดเนื้อหา
        </div>
        <div className="bg-slate-50/40 p-5 rounded-md border-l-4 border-orange-500/80">
          <p className="text-slate-600 text-sm leading-relaxed italic">"{item.detail}"</p>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <span className="bg-slate-100 border text-[10px] text-slate-500 px-2.5 py-1 rounded-[7px] font-bold uppercase tracking-wider">SUT</span>
          <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-2.5 py-1 rounded-[7px] font-bold uppercase tracking-wider">ASSET</span>
        </div>
        <Link href={`/user/requests/tracking?id=${item.id}`}>
          <button className="text-orange-500 font-bold text-sm flex items-center hover:text-orange-600 transition-colors">
            {item.type === 'requests' ? 'ดูรายละเอียดคำร้อง' : 'เปิดห้องสนทนา'} 
            <ChevronRight size={18} className="ml-1" />
          </button>
        </Link>
      </div>
    </div>
  );
};
