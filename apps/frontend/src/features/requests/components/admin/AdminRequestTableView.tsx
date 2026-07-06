"use client";
import React from 'react';
import {
  Search, Download, ChevronDown, ChevronLeft, ChevronRight,
  Wrench, ShoppingCart, Calendar as CalendarIcon, RotateCcw,
  ArrowRight, CheckCircle2, User, SlidersHorizontal
} from 'lucide-react';
import { useAdminRequests } from '../../presentation/hooks/useAdminRequests';

export default function AdminRequestTableView() {
  const {
    isMounted,
    currentTab,
    setCurrentTab,
    inquirySubTab,
    setInquirySubTab,
    searchTerm,
    setSearchTerm,
    requests,
    inquiries,
    isLoading,
    handleRequestClick,
    handleInquiryClick
  } = useAdminRequests();

  if (!isMounted) {
    return null;
  }

  // Helper to determine request type icons
  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('ซ่อม')) return <Wrench size={14} className="text-orange-500" />;
    if (t.includes('เบิก') || t.includes('จ่าย')) return <ShoppingCart size={14} className="text-blue-500" />;
    if (t.includes('จอง') || t.includes('พื้นที่')) return <CalendarIcon size={14} className="text-green-500" />;
    return <RotateCcw size={14} className="text-slate-500" />;
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REJECT': return 'bg-red-50 text-red-500 border border-red-100';
      case 'IN-PROGRESS': return 'bg-blue-50 text-blue-500 border border-blue-100';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border border-green-100';
      case 'CANCELLED': return 'bg-slate-100 text-slate-400 border border-slate-200';
      case 'PENDING': 
      default: return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REJECT': return 'ปฏิเสธ';
      case 'IN-PROGRESS': return 'กำลังดำเนินการ';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'CANCELLED': return 'ยกเลิก';
      case 'PENDING':
      default: return 'รอดำเนินการ';
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {currentTab === 'requests' ? 'จัดการรายการคำร้อง' : 'กล่องข้อความติดต่อสอบถาม'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === 'requests'
              ? 'ตรวจสอบและดำเนินการคำร้องขอใช้สินทรัพย์ รวมถึงการแจ้งซ่อมและบำรุงรักษา'
              : 'อ่านและดำเนินการตอบกลับข้อความติดต่อสอบถามข้อมูลทั่วไปจากหน้าเว็บไซต์'}
          </p>
        </div>
      </div>

      {/* 📍 แถบแท็บหลักสลับการทำงาน (Tabs Bar) */}
      <div className="flex justify-between items-center mb-6 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentTab('requests')}
            className={`px-6 py-3 rounded-full text-xs font-black transition-all cursor-pointer ${
              currentTab === 'requests'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            รายการคำร้องแจ้งซ่อมทั้งหมด
          </button>
          <button
            onClick={() => setCurrentTab('inquiries')}
            className={`px-6 py-3 rounded-full text-xs font-black transition-all cursor-pointer ${
              currentTab === 'inquiries'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            ข้อความติดต่อสอบถาม
          </button>
        </div>

        {/* ฟิลเตอร์ย่อยสำหรับแท็บข้อความติดต่อสอบถาม */}
        {currentTab === 'inquiries' && (
          <div className="flex space-x-1 bg-slate-50 p-1 rounded-full border border-slate-100">
            <button
              onClick={() => setInquirySubTab('unread')}
              className={`px-4 py-2 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                inquirySubTab === 'unread'
                  ? 'bg-white text-orange-500 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ยังไม่ได้ตอบกลับ
            </button>
            <button
              onClick={() => setInquirySubTab('replied')}
              className={`px-4 py-2 rounded-full text-[10px] font-black transition-all cursor-pointer ${
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

      {/* Search & Control Tools */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center shadow-sm">
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
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]">
              <SlidersHorizontal size={14} /> กรองข้อมูลเพิ่มเติม
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-bold text-sm animate-pulse">กำลังโหลดข้อมูลรายการ...</p>
        </div>
      ) : currentTab === 'requests' ? (
        /* --- [TAB 1] รายการคำร้องแจ้งซ่อมคอลัมน์ดึงจากฐานข้อมูลจริง --- */
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">รหัสคำร้อง</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">หัวข้อ</th>
                <th className="px-6 py-4">ผู้แจ้ง</th>
                <th className="px-6 py-4">สถานที่</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-5 text-xs font-bold text-orange-500">#{req.id}</td>
                    <td className="px-6 py-5 text-xs font-black text-slate-600 flex items-center gap-1.5 pt-6">
                      {getTypeIcon(req.type)} {req.type}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-slate-800 leading-normal">{req.title}</p>
                      {req.email && <p className="text-[9px] font-mono text-slate-400 mt-0.5">{req.email}</p>}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">{req.sender}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">{req.location}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${getStatusStyle(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-slate-400">{req.date}</td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleRequestClick(req.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all active:scale-[0.96]"
                      >
                        เปิดจัดการ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    ไม่พบข้อมูลรายการคำร้องแจ้งซ่อม
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 border-t flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>แสดง {requests.length} จากทั้งหมด {requests.length} รายการ</span>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronLeft size={16} /></button>
              <button className="bg-[#E9652B] text-white w-8 h-8 rounded-lg">1</button>
              <button className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        /* --- [TAB 2] ส่วนจัดการกล่องข้อความติดต่อสอบถามของระบบฝั่ง Admin --- */
        <div className="space-y-4">
          {inquiries
            .filter(item => item.status === inquirySubTab)
            .map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6 hover:border-orange-200 transition-all animate-in fade-in duration-200"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{inq.id}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">{inq.type}</span>
                    <span className="text-xs text-slate-400 font-medium ml-2">{inq.date}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-lg">{inq.subject}</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">"{inq.detail}"</p>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 text-xs font-semibold text-slate-400 border-t border-slate-50">
                    <span className="text-slate-600 flex items-center"><User size={13} className="mr-1 text-slate-400" /> {inq.name}</span>
                    <span>เบอร์โทร: <span className="text-slate-600 font-mono">{inq.phone}</span></span>
                    <span>อีเมล: <span className="text-slate-600 font-mono">{inq.email}</span></span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-2 min-w-[140px] border-l border-dashed pl-0 md:pl-6 border-slate-100">
                  {inq.status === 'unread' ? (
                    <>
                      <button 
                        onClick={() => handleInquiryClick(inq.id)}
                        className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-orange-100 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        ตอบกลับแชท <ArrowRight size={14} className="ml-1.5" />
                      </button>
                      <button className="w-full bg-slate-50 text-slate-500 py-2 rounded-xl text-xs font-bold border hover:bg-slate-100 transition-colors cursor-pointer">
                        ส่งต่อสายช่าง
                      </button>
                    </>
                  ) : (
                    <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center">
                      <CheckCircle2 size={14} className="mr-1.5" /> ตอบกลับแล้ว
                    </span>
                  )}
                </div>
              </div>
            ))}
          {inquiries.filter(item => item.status === inquirySubTab).length === 0 && (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
              ไม่มีข้อความติดต่อสอบถามในหมวดหมู่นี้
            </div>
          )}
        </div>
      )}
    </main>
  );
}

const FilterSelect = ({ label }: { label: string }) => (
  <div className="bg-white border rounded-xl px-4 py-2 text-sm font-bold text-slate-600 flex items-center cursor-pointer hover:bg-slate-50 shadow-sm">
    {label} <ChevronDown size={16} className="ml-2 text-slate-400" />
  </div>
);
