"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  FileText, 
  Settings, 
  LogOut,
  User,
  ChevronDown,
  MapPin,
  Calendar,
  Upload,
  Send,
  X,
  CheckCircle2
} from 'lucide-react';
import { Asset } from 'next/font/google';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// --- Sub-component: Success Modal ---
const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-8">สร้างคำร้องสำเร็จ</h2>
          <div className="w-full space-y-4">
            <button 
              onClick={() => router.push('/requests/tracking')} 
              className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              ติดตามคำร้อง
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              สร้างคำร้องใหม่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component: CreateRequestPage ---
const CreateRequestPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // จำลองการส่งข้อมูลสำเร็จ
    setShowSuccess(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Success Modal Overlay */}
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#E9652B]">Asset SUT</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Modern Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="แดชบอร์ด" />
          <NavItem icon={<ClipboardList size={18} />} label="รายการคำร้อง" />
          <NavItem icon={<PlusCircle size={18} />} label="แจ้งเรื่องใหม่" active />
          <NavItem icon={<FileText size={18} />} label="ติดตามคำร้อง" />
          <NavItem icon={<Settings size={18} />} label="ตั้งค่า" />
        </nav>
        <div className="p-4">
          <button className="flex items-center justify-center w-full py-3 bg-[#E9652B] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className='mb-4'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">หน้าหลัก</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/user/requests">ติดต่อเรา</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>สร้างคำร้องใหม่</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Header Section */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mt-3">สร้างคำร้องใหม่</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
            กรุณากรอกรายละเอียดด้านล่างเพื่อแจ้งความประสงค์ สอบถาม หรือร้องเรียนเกี่ยวกับ
            สินทรัพย์ของมหาวิทยาลัย ทีมงานจะดำเนินการตรวจสอบและตอบกลับโดยเร็วที่สุด
          </p>
        </header>

        {/* Guest Notification Banner */}
        <div className="bg-[#E3F2FD] border border-blue-100 rounded-2xl p-4 flex items-center space-x-4 mb-8">
          <div className="bg-blue-500 p-2 rounded-lg text-white">
            <User size={20} />
          </div>
          <div>
            <h4 className="text-blue-800 font-bold text-sm">คุณกำลังเข้าใช้งานในโหมดผู้เยี่ยมชม</h4>
            <p className="text-blue-600/80 text-xs">กรุณาระบุข้อมูลติดต่อเพื่อให้เจ้าหน้าที่สามารถประสานงานกลับไปได้</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Main Form */}
          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <label className="block text-center text-sm font-bold text-gray-700 mb-3">ประเภทคำร้อง</label>
                <div className="relative">
                  <select className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 appearance-none text-gray-600 outline-none cursor-pointer">
                    <option>เลือกประเภทคำร้อง</option>
                    <option>แจ้งซ่อมครุภัณฑ์</option>
                    <option>แจ้งปัญหาการใช้งานพื้นที่</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-center text-sm font-bold text-gray-700 mb-3">หัวข้อ</label>
                <input 
                  type="text" 
                  placeholder="ระบุหัวข้อที่ต้องการแจ้ง"
                  className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 outline-none"
                />
              </div>

              <div>
                <label className="block text-center text-sm font-bold text-gray-700 mb-3">รายละเอียด</label>
                <textarea 
                  rows={6}
                  placeholder="กรุณาบรรยายรายละเอียดของคำร้องอย่างครบถ้วน..."
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-4 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Meta Info */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border-t-4 border-t-[#E9652B] border border-gray-100">
              <div className="flex items-center text-sm font-bold text-gray-700 mb-4">
                <User size={16} className="mr-2 text-gray-400" /> ข้อมูลติดต่อ
              </div>
              <input 
                type="text" 
                placeholder="อีเมล หรือ เบอร์โทรศัพท์"
                className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 text-sm outline-none"
              />
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">สถานที่ (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="ระบุอาคาร/ห้อง" className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">วันที่เกิดเหตุ (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
              <label className="text-[11px] font-bold text-gray-400 uppercase mb-3 block">แนบไฟล์ประกอบ</label>
              <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50">
                <Upload className="text-orange-300 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-600">คลิกเพื่ออัปโหลด</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <footer className="mt-10 pt-8 border-t border-gray-200 flex justify-end items-center space-x-6">
          <button className="text-gray-500 font-bold hover:text-gray-700 transition-colors">ยกเลิก</button>
          <button 
            onClick={handleSubmit}
            className="bg-[#E9652B] text-white px-10 py-3 rounded-xl font-bold flex items-center hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
          >
            ส่งเรื่องคำร้อง <Send size={18} className="ml-2 transform rotate-45" />
          </button>
        </footer>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-orange-50 text-[#E9652B] font-bold' : 'text-gray-500 hover:bg-gray-50'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export default CreateRequestPage;