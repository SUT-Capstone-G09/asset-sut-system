"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import {
  ArrowLeft, Bell, Settings, User, MapPin,
  Calendar, FileText, Send, Paperclip, ChevronDown, Download, AlertCircle, X,
  LayoutDashboard, ClipboardList, PlusCircle
} from 'lucide-react';


// --- Sub-component: ConfirmSaveModal ---
const ConfirmSaveModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการบันทึกข้อมูล",
  message = "คุณต้องการบันทึกการเปลี่ยนแปลงสถานะและเจ้าหน้าที่ผู้รับผิดชอบใช่หรือไม่?"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={44} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">{message}</p>
          <div className="flex flex-col w-full space-y-3">
            <button
              onClick={onConfirm}
              className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              ยืนยันการบันทึก
            </button>
            <button onClick={onClose} className="w-full bg-white text-slate-400 font-bold py-3 hover:text-slate-600 transition-all">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const AdminRequestDetail = () => {
  const router = useRouter();
  const [status, setStatus] = useState('In Progress');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSaveClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    // Logic การส่ง API สามารถใส่ตรงนี้
    console.log("Saving changes for status:", status);
    setIsConfirmOpen(false);
    // แสดงผลสำเร็จหรือแจ้งเตือนผู้ใช้ตามต้องการ
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans">
      {/* Confirm Modal */}
      <ConfirmSaveModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <div className="flex-1">
        {/* Header */}
        {/* <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          
          <div className="flex items-center space-x-4">
             <div className="text-right mr-3">
                <p className="text-xs font-black text-slate-800 leading-none">Admin Somsak</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Asset Manager</p>
             </div>
             <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
          </div>
        </header> */}

        <main className="flex-1 p-8 overflow-y-auto">
        <div className='mb-4'>
          <AssetBreadcrumb
            items={[
              { label: "หน้าหลัก", href: "/" },
              { label: "รายการคำร้อง", href: "/admin/requests" },
              { label: "รายละเอียดคำร้อง #REF-2024-089" }
            ]}
          />
        </div>
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Left Content */}
            <div className="col-span-8 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>
                  <span className="text-slate-400 font-bold text-sm">REF-2024-089</span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 leading-tight mb-4">พบปัญหาท่อน้ำแตกบริเวณชั้น 2 อาคารบรรณสาร (Library)</h1>
                <p className="text-slate-500 text-lg leading-relaxed">มีน้ำรั่วซึมไหลออกมาจากเพดานบริเวณโซนที่นั่งอ่านหนังสือเงียบ ชั้น 3 ใกล้กับจุดปลั๊กไฟ รบกวนรีบดำเนินการตรวจสอบก่อนที่จะส่งผลเสียต่อสินทรัพย์และหนังสือจะเสียหาย</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <InfoSmall icon={<MapPin className="text-orange-500" />} label="สถานที่" value="อาคารบรรณสาร (ชั้น 3)" />
                <InfoSmall icon={<Calendar className="text-orange-500" />} label="วันที่แจ้ง" value="24 Oct 2024, 14:30" />
                <InfoSmall icon={<FileText className="text-orange-500" />} label="ประเภท" value="แจ้งซ่อมบำรุง" />
              </div>

              <div>
                <h4 className="font-black text-slate-800 mb-4 flex items-center"><Paperclip size={18} className="mr-2" /> ไฟล์แนบและหลักฐาน</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-slate-200 rounded-3xl overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://i0.wp.com/krujakkrapong.com/wp-content/uploads/2024/07/%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%9A%E0%B9%81%E0%B8%88%E0%B9%89%E0%B8%87%E0%B8%8B%E0%B9%88%E0%B8%AD%E0%B8%A12-1.jpg?fit=800%2C450&ssl=1" alt="evidence-1" className="w-full h-full object-cover" />
                  </div>
                  <div className="h-48 bg-slate-200 rounded-3xl overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://www.shutterstock.com/image-vector/cheerful-cartoon-handyman-hard-hat-260nw-2708489951.jpg" alt="evidence-2" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-black text-slate-800 flex items-center tracking-tight"><FileText size={18} className="mr-2" /> ประวัติการสนทนา</h4>
                <div className="space-y-4">
                  <ChatBubble name="NALINEE J." time="14:35" text="แจ้งเพิ่มเติมค่ะ ตรงบริเวณที่แตกมีปลั๊กไฟอยู่ใกล้ๆ ด้วยค่ะ" />
                  <ChatBubble name="ADMIN SOMSAK" time="14:40" text="รับทราบครับ กำลังประสานงานช่างอาคารที่ดูแลโซนบรรณสารให้รีบเข้าไปตรวจสอบด่วนครับ" isAdmin />
                </div>
                <div className="flex items-center space-x-3 bg-slate-100 p-3 rounded-2xl">
                  <input type="text" placeholder="พิมพ์ข้อความตอบกลับผู้แจ้ง..." className="bg-transparent flex-1 text-sm outline-none px-2" />
                  <Paperclip size={18} className="text-slate-400 cursor-pointer" />
                  <button className="bg-orange-500 text-white p-2 rounded-xl"><Send size={16} /></button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Status Update */}
            <div className="col-span-4 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h4 className="font-black text-slate-800 mb-6">การจัดการคำร้อง</h4>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">เปลี่ยนสถานะ</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 appearance-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        <option>In Progress</option>
                        <option>Pending</option>
                        <option>Resolved</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">มอบหมายเจ้าหน้าที่</label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 appearance-none text-sm font-bold text-slate-700 outline-none cursor-pointer">
                        <option>นายวัชรินทร์ แสนอ่อน (ฝ่ายประปา)</option>
                        <option>นายสมชาย (ฝ่ายไฟฟ้า)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveClick}
                    className="w-full bg-[#E9652B] text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-[0.98]"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                  <button className="w-full text-orange-500 text-xs font-bold py-2 hover:underline flex items-center justify-center">
                    <Download size={14} className="mr-2" /> ดาวน์โหลด PDF สรุปคำร้อง
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h4 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-sm">Activity Log</h4>
                <div className="space-y-6">
                  <LogItem user="Admin Somsak" action="มอบหมายงานให้ นายวัชรินทร์ แสนอ่อน" time="15 MINS AGO" />
                  <LogItem user="System Automatic" action="เปลี่ยนสถานะเป็น In Progress" time="18 MINS AGO" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components
const InfoSmall = ({ icon, label, value }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
      {icon} <span>{label}</span>
    </div>
    <p className="text-sm font-black text-slate-700">{value}</p>
  </div>
);

const ChatBubble = ({ name, time, text, isAdmin = false }: any) => (
  <div className={`space-y-1 ${isAdmin ? 'flex flex-col items-start' : ''}`}>
    <div className="flex items-center space-x-2 text-[10px] font-black">
      <span className={isAdmin ? 'text-blue-500' : 'text-orange-500'}>{name}</span>
      <span className="text-slate-300">{time}</span>
    </div>
    <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[90%] ${isAdmin ? 'bg-blue-600 text-white rounded-tl-none shadow-md shadow-blue-100' : 'bg-white border text-slate-600 rounded-tr-none'}`}>
      {text}
    </div>
  </div>
);

const LogItem = ({ user, action, time }: any) => (
  <div className="flex items-start space-x-3">
    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
      <User size={14} className="text-slate-400" />
    </div>
    <div>
      <p className="text-xs font-black text-slate-700">{user}</p>
      <p className="text-[10px] text-slate-400 font-medium leading-tight">{action}</p>
      <p className="text-[9px] text-slate-300 mt-1 font-bold">{time}</p>
    </div>
  </div>
);

const SidebarNavItem = ({ label, icon, active }: { label: string; icon: React.ReactNode; active?: boolean }) => (
  <div
    className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${active
        ? 'bg-orange-50 text-orange-600'
        : 'text-slate-400 hover:bg-slate-50 hover:text-orange-600'
      }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </div>
);

export default AdminRequestDetail;