"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquareText, 
  FileText, 
  Clock, 
  HelpCircle, 
  PlusCircle, 
  ChevronRight, 
  Wrench,
  Search
} from 'lucide-react';
import { useAuthContext } from "@/lib/context/auth-context";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { useDashboard } from '../hooks/useDashboard';

export const UserRequests = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    isMounted,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredItems,
    counts
  } = useDashboard();

  if (!isMounted) {
    return null;
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : "ผู้ใช้งาน ทั่วไป";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 font-sans">
      
      {/* Breadcrumb */}
      <div className="mb-4">
        <AssetBreadcrumb
          items={[
            { label: "หน้าหลัก", href: "/" },
            { label: "คำร้องขอ" }
          ]}
        />
      </div>

      {/* Welcome Banner Header */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">สวัสดี, คุณ {displayName}</h2>
          <p className="text-slate-400 text-sm mt-1">สร้างคำร้อง หรือจัดส่งข้อความประสานงานติดต่อสอบถามของคุณทั้งหมดได้ที่นี่</p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={() => router.push('/user/requests/add-request')}
            className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
          >
            <PlusCircle size={18} className="mr-2" /> แจ้งเรื่องใหม่
          </button>
        </div>
      </div>

      {/* 🛠️ ส่วนตัวกรองข้อมูลขั้นสูง (Filter & Search Bar Area) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Tabs คัดแยกประเภทการแสดงผล */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ทั้งหมด ({counts.all})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'requests' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Wrench size={12} /> คำร้องซ่อม ({counts.requests})
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'inquiries' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MessageSquareText size={12} /> ข้อความสอบถาม ({counts.inquiries})
          </button>
        </div>

        {/* ช่องค้นหาข้อมูลแบบพิมพ์คีย์เวิร์ด */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="ค้นหาเลขที่, หัวข้อเรื่อง..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all"
          />
        </div>
      </div>

      {/* 📊 รายการแสดงผล Grid คอลัมน์รายการทั้งหมด */}
      <div className="grid grid-cols-1 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative transition-all duration-200 hover:shadow-md hover:border-orange-100"
            >
              {/* Card Top Section */}
              <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
                <div>
                  <span className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-1">
                    {item.type === 'requests' ? 'Asset Request' : 'Inquiry Context'}
                  </span>
                  <h4 className="text-2xl font-black text-slate-700">{item.id}</h4>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center ${item.statusClass}`}>
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
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">หมวดหมู่รายการ</p>
                  <p className="text-slate-700 font-bold text-xs">{item.category}</p>
                </div>
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">วันที่บันทึกระบบ</p>
                  <p className="text-slate-700 font-bold text-xs">{item.date}</p>
                </div>
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase">สถานที่อ้างอิง</p>
                  <p className="text-slate-700 font-bold text-xs">{item.location}</p>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <FileText size={14} className="mr-1.5 text-slate-300" /> รายละเอียดเนื้อหา
                </div>
                <div className="bg-slate-50/40 p-5 rounded-2xl border-l-4 border-orange-500/80">
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{item.detail}"</p>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <span className="bg-slate-100 border text-[10px] text-slate-500 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">SUT</span>
                  <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">ASSET</span>
                </div>
                <Link href={`/user/requests/tracking?id=${item.id}`}>
                  <button className="text-orange-500 font-bold text-sm flex items-center hover:text-orange-600 transition-colors">
                    {item.type === 'requests' ? 'ดูรายละเอียดคำร้อง' : 'เปิดห้องสนทนา'} 
                    <ChevronRight size={18} className="ml-1" />
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
            ไม่พบประวัติข้อมูลคำร้องหรือข้อความสอบถามในหมวดหมู่นี้
          </div>
        )}
      </div>

      {/* Footer Base Contact Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-start space-x-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-slate-400"><Clock size={20} /></div>
          <div>
            <h5 className="font-bold text-slate-700 text-sm">อัปเดตระบบเรียลไทม์</h5>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">สามารถคลิกปุ่มดูรายละเอียดเพื่อประสานงาน คุยแชทโต้ตอบ หรือส่งหลักฐานเพิ่มเติมให้กับเจ้าหน้าที่ประจำส่วนงานได้ทันที</p>
          </div>
        </div>
        <div className="bg-orange-50/40 border border-dashed border-orange-100 rounded-3xl p-6 flex items-start space-x-4">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-md text-white"><HelpCircle size={20} /></div>
          <div>
            <h5 className="font-bold text-slate-700 text-sm">มีปัญหาในการค้นหาข้อมูล?</h5>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">ติดต่อศูนย์บริการส่วนบริหารสินทรัพย์เชิงพาณิชย์ มหาวิทยาลัยเทคโนโลยีสุรนารี โทร. 044-223-XXX ในเวลาทำการ</p>
          </div>
        </div>
      </div>

    </div>
  );
};
