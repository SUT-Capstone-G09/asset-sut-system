"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, PlusCircle, FileText,
  Search, Bell, Settings, LogOut, Download,
  ChevronDown, Filter, ChevronLeft, ChevronRight, Calendar,
  Wrench, ShoppingCart, Calendar as CalendarIcon, RotateCcw,
  MessageSquareText, ArrowRight, CheckCircle2, AlertCircle, User
} from 'lucide-react';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import {
  DEFAULT_ADMIN_REQUESTS,
  DEFAULT_ADMIN_INQUIRIES,
} from "../../mock/adminRequestMock";

export default function AdminRequestTableView() {
  const router = useRouter();
  
  // 📍 สเตทควบคุมแท็บหลัก ('requests' = คำร้องแจ้งซ่อม, 'inquiries' = ข้อความติดต่อสอบถาม)
  const [currentTab, setCurrentTab] = useState<'requests' | 'inquiries'>('requests');
  const [inquirySubTab, setInquirySubTab] = useState('unread');

  // ข้อมูลคำร้องเดิม (จาก REQ Table)
  const requests = DEFAULT_ADMIN_REQUESTS;

  // ข้อมูลจำลองข้อความที่ส่งมาจากหน้าติดต่อสอบถามของฝั่ง User
  const inquiries = DEFAULT_ADMIN_INQUIRIES;

  return (
    <main className="flex-1 p-8 overflow-y-auto min-h-screen">
      <div className="mb-4">
        <AssetBreadcrumb
          items={[
            { label: "หน้าหลัก", href: "/" },
            { label: "ระบบจัดการคำร้อง", href: "/requests/dashboard" },
            { label: currentTab === 'requests' ? "รายการคำร้อง" : "กล่องข้อความติดต่อสอบถาม" }
          ]}
        />
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-bold text-[#E9652B] uppercase tracking-widest mb-1">Admin Dashboard</p>
          <h2 className="text-3xl font-black text-slate-800">
            {currentTab === 'requests' ? 'จัดการรายการคำร้อง' : 'กล่องข้อความติดต่อสอบถาม'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === 'requests' 
              ? 'ตรวจสอบและดำเนินการคำร้องขอใช้สินทรัพย์ รวมถึงการแจ้งซ่อมและบำรุงรักษา' 
              : 'อ่านและดำเนินการตอบกลับข้อความติดต่อสอบถามข้อมูลทั่วไปจากหน้าเว็บไซต์'}
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white border px-4 py-2 rounded-xl text-sm font-bold shadow-sm">ทั้งหมด <span className="text-orange-500 ml-2">1,284</span></div>
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">รอดำเนินการ 12</div>
          <button className="bg-white border px-4 py-2 rounded-xl text-sm font-bold text-slate-600 flex items-center hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} className="mr-2" /> ส่งออกรายงาน
          </button>
        </div>
      </div>

      {/* 📍 แถบแท็บหลักสลับการทำงาน (Tabs Bar) */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold mb-6">
        <button 
          onClick={() => setCurrentTab('requests')}
          className={`pb-3 transition-all relative ${currentTab === 'requests' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span>คำร้องแจ้งซ่อม / บริการ</span>
          {currentTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setCurrentTab('inquiries')}
          className={`pb-3 transition-all relative flex items-center gap-2 ${currentTab === 'inquiries' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span>ข้อความติดต่อสอบถาม</span>
          <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans">
            {inquiries.filter(i => i.status === 'unread').length}
          </span>
          {currentTab === 'inquiries' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />}
        </button>
      </div>

      {/* 🎛️ Dynamic Filter Bar ปรับตามแท็บที่เลือก */}
      {currentTab === 'requests' ? (
        <div className="flex space-x-4 mb-8 items-center">
          <FilterSelect label="สถานะ : ทั้งหมด" />
          <FilterSelect label="ประเภท : ทั้งหมด" />
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="วว / ดด / ปปปป" className="bg-white border rounded-xl py-2 pl-10 pr-4 text-sm w-40 outline-none" />
          </div>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-200">กรองข้อมูล</button>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/60 mb-6 max-w-fit">
          <button onClick={() => setInquirySubTab('unread')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${inquirySubTab === 'unread' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>ยังไม่ได้อ่าน ({inquiries.filter(i => i.status === 'unread').length})</button>
          <button onClick={() => setInquirySubTab('replied')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${inquirySubTab === 'replied' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>ตอบกลับแล้ว ({inquiries.filter(i => i.status === 'replied').length})</button>
        </div>
      )}

      {/* 📊 Content Layout Rendering */}
      {currentTab === 'requests' ? (
        /* --- [TAB 1] ตารางจัดการคำร้องแบบเดิมของคุณ --- */
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700">รายการคำร้อง</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">แสดง 3 จาก 1,284 รายการ</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50/30 text-[10px] uppercase font-black text-slate-300 tracking-tighter border-b">
              <tr>
                <th className="px-6 py-4">Refcode</th>
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
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-orange-500">#{req.id}</td>
                  <td className="px-6 py-5 text-xs text-slate-500 flex items-center gap-1.5">{req.icon} {req.type}</td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-700">{req.title}</p>
                    <p className="text-[9px] text-slate-300">ID: {req.asset}</p>
                  </td>
                  <td className="px-6 py-5 text-xs text-slate-500">{req.sender}</td>
                  <td className="px-6 py-5 text-xs text-slate-500">{req.location}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${getStatusStyle(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-5 text-[10px] text-slate-400">{req.date}</td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => router.push(`/admin/requests/manage-requests`)}
                      className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-200"
                    >
                      เปิดดู
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 border-t flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>แสดง 3 จากทั้งหมด 1,248 รายการ</span>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={16} /></button>
              <button className="bg-orange-500 text-white w-8 h-8 rounded-lg">1</button>
              <button className="w-8 h-8 hover:bg-slate-100 rounded-lg">2</button>
              <button className="w-8 h-8 hover:bg-slate-100 rounded-lg">3</button>
              <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={16} /></button>
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
                    <span className="text-slate-600 flex items-center"><User size={13} className="mr-1 text-slate-400"/> {inq.name}</span>
                    <span>เบอร์โทร: <span className="text-slate-600 font-mono">{inq.phone}</span></span>
                    <span>อีเมล: <span className="text-slate-600 font-mono">{inq.email}</span></span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-2 min-w-[140px] border-l border-dashed pl-0 md:pl-6 border-slate-100">
                  {inq.status === 'unread' ? (
                    <>
                      <button className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-orange-100 flex items-center justify-center transition-colors">
                        ตอบกลับแชท <ArrowRight size={14} className="ml-1.5"/>
                      </button>
                      <button className="w-full bg-slate-50 text-slate-500 py-2 rounded-xl text-xs font-bold border hover:bg-slate-100 transition-colors">
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

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'URGENT': return 'bg-red-50 text-red-500';
    case 'IN-PROGRESS': return 'bg-blue-50 text-blue-500';
    case 'RESOLVED': return 'bg-green-50 text-green-500';
    default: return 'bg-slate-50 text-slate-500';
  }
};
