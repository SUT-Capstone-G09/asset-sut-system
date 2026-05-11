"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ClipboardList, PlusCircle, FileText, 
  Search, Bell, Settings, LogOut, Download, 
  ChevronDown, Filter, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { AssetBreadcrumb } from '@/components/layout/AssetBreadcrumb';

const AdminRequestTable = () => {
  const router = useRouter();

  const requests = [
    { id: 'REQ-2023-0842', type: 'แจ้งซ่อม', title: 'เครื่องปรับอากาศขัดข้อง', asset: 'AC-F12-004', sender: 'สมชาย ใจดี', location: 'อาคารบรรณสาร', status: 'URGENT', date: '24 ต.ค. 2566' },
    { id: 'REQ-2023-0841', type: 'เบิกจ่าย', title: 'ขอเบิกอุปกรณ์สำนักงาน', asset: 'NB-SUT-112', sender: 'วิภาวรรณ มั่นคง', location: 'ตึกศูนย์เครื่องมือ', status: 'IN-PROGRESS', date: '23 ต.ค. 2566' },
    { id: 'REQ-2023-0840', type: 'จองสถานที่', title: 'จองห้องประชุม', asset: 'R-CONF-02', sender: 'ศ.ดร. มานะ ชูเกียรติ', location: 'อาคารวิชาการ 1', status: 'RESOLVED', date: '22 ต.ค. 2566' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans">
      {/* Sidebar - สไตล์เดิม */}
      <aside className="w-64 bg-white border-r flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#E9652B]">Asset SUT</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="แดชบอร์ด" />
          <NavItem icon={<ClipboardList size={18} />} label="รายการคำร้อง" active />
          <NavItem icon={<PlusCircle size={18} />} label="แจ้งเรื่องใหม่" />
          <NavItem icon={<FileText size={18} />} label="ติดตามคำร้อง" />
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-4">
          <AssetBreadcrumb 
            items={[
              { label: "หน้าหลัก", href: "/" },
              { label: "ระบบจัดการคำร้อง", href: "/requests/dashboard" },
              { label: "รายการคำร้อง" }
            ]} 
          />
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#E9652B] uppercase tracking-widest mb-1">Admin Dashboard</p>
            <h2 className="text-3xl font-black text-slate-800">จัดการรายการคำร้อง</h2>
            <p className="text-sm text-slate-400 mt-1">ตรวจสอบและดำเนินการคำร้องขอใช้สินทรัพย์ รวมถึงการแจ้งซ่อมและบำรุงรักษา</p>
          </div>
          <div className="flex space-x-3">
             <div className="bg-white border px-4 py-2 rounded-xl text-sm font-bold">ทั้งหมด <span className="text-orange-500 ml-2">1,284</span></div>
             <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold">รอดำเนินการ 12</div>
             <button className="bg-white border px-4 py-2 rounded-xl text-sm font-bold text-slate-600 flex items-center hover:bg-slate-50 transition-colors">
               <Download size={16} className="mr-2" /> ส่งออกรายงาน
             </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex space-x-4 mb-8 items-center">
          <FilterSelect label="สถานะ : ทั้งหมด" />
          <FilterSelect label="ประเภท : ทั้งหมด" />
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="วว / ดด / ปปปป" className="bg-white border rounded-xl py-2 pl-10 pr-4 text-sm w-40 outline-none" />
          </div>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-200">กรองข้อมูล</button>
        </div>

        {/* Request Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700">รายการคำร้อง</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">แสดง 4 จาก 1,284 รายการ</span>
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
                  <td className="px-6 py-5 text-xs text-slate-500">{req.type}</td>
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
                      onClick={() => router.push(`/requests/manage-requests`)} // Link ไปหน้าจัดการ
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
            <span>แสดง 4 จากทั้งหมด 1,248 รายการ</span>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={16} /></button>
              <button className="bg-orange-500 text-white w-8 h-8 rounded-lg">1</button>
              <button className="w-8 h-8 hover:bg-slate-100 rounded-lg">2</button>
              <button className="w-8 h-8 hover:bg-slate-100 rounded-lg">3</button>
              <button className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, active = false }: any) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-50 text-[#E9652B] font-bold' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const FilterSelect = ({ label }: { label: string }) => (
  <div className="bg-white border rounded-xl px-4 py-2 text-sm font-bold text-slate-600 flex items-center cursor-pointer hover:bg-slate-50">
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

export default AdminRequestTable;