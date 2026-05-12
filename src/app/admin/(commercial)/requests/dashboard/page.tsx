import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, ClipboardList, PlusCircle, FileText, 
  Search, Bell, Settings, LogOut, Download, 
  Wrench, ShoppingCart, Calendar as CalendarIcon, RotateCcw,
  ChevronRight, MoreHorizontal, ArrowLeft
} from 'lucide-react';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const AdminDashboard = () => {
  const stats = [
    { label: 'คำร้องทั้งหมด', value: '1,284', sub: 'Update Today', color: 'bg-[#E9652B]', textColor: 'text-white' },
    { label: 'รอดำเนินการ', value: '42', sub: 'เพิ่มขึ้น 2 รายการวันนี้', color: 'bg-white', textColor: 'text-red-500' },
    { label: 'กำลังดำเนินการ', value: '156', sub: 'อัปเดตล่าสุด 10:30 น.', color: 'bg-white', textColor: 'text-blue-500' },
    { label: 'เสร็จสิ้น', value: '1,086', sub: '92% ของคำร้องทั้งหมด', color: 'bg-white', textColor: 'text-green-500' },
  ];

  const requests = [
    { id: '#REQ-2023-0842', type: 'แจ้งซ่อม', icon: <Wrench size={14}/>, title: 'เครื่องปรับอากาศขัดข้อง', asset: 'Asset ID: AC-F12-004', sender: 'สมชาย ใจดี', email: 'somchai.j@sut.ac.th', location: 'อาคารบรรณสาร', status: 'เร่งด่วน', date: '24 ม.ค.', statusColor: 'text-red-500 bg-red-50' },
    { id: '#REQ-2023-0841', type: 'เบิกจ่าย', icon: <ShoppingCart size={14}/>, title: 'ขอเบิกอุปกรณ์สำนักงาน', asset: 'Asset ID: NB-SUT-112', sender: 'วิภาวรรณ มั่นคง', email: 'wipawan.m@sut.ac.th', location: 'ดิสศูนย์เครื่องมือ', status: 'กำลังดำเนินการ', statusColor: 'text-blue-500 bg-blue-50' },
    { id: '#REQ-2023-0840', type: 'จองสถานที่', icon: <CalendarIcon size={14}/>, title: 'จองห้องประชุม', asset: 'Room ID: R-CONF-02', sender: 'ศ.ดร. มานะ ชูเกียรติ', email: 'mana.c@sut.ac.th', location: 'อาคารวิชาการ 1', status: 'เสร็จสิ้น', statusColor: 'text-green-500 bg-green-50' },
    { id: '#REQ-2023-0839', type: 'คืนสินทรัพย์', icon: <RotateCcw size={14}/>, title: 'คืนอุปกรณ์ยืม', asset: 'Asset ID: CAM-009', sender: 'Guest User', email: 'visitor_332@gmail.com', location: 'ศูนย์นวัตกรรม', status: 'รอตรวจสอบ', statusColor: 'text-gray-500 bg-gray-50' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#E9652B]">Asset SUT</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Modern Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="แดชบอร์ด" active />
          <NavItem icon={<ClipboardList size={18} />} label="รายการคำร้อง" />
          <NavItem icon={<PlusCircle size={18} />} label="แจ้งเรื่องใหม่" />
          <NavItem icon={<FileText size={18} />} label="ติดตามคำร้อง" />
        </nav>
        <div className="p-4">
          <button className="flex items-center justify-center w-full py-3 bg-[#E9652B] text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">หน้าหลัก</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>ระบบจัดการคำร้อง</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="ค้นหาข้อมูลสินทรัพย์..." className="bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-72 outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div className="flex items-center space-x-4 border-l pl-6">
              <Bell size={20} className="text-gray-400 cursor-pointer" />
              <Settings size={20} className="text-gray-400 cursor-pointer" />
              <div className="flex items-center space-x-3 ml-2">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">Admin User</p>
                  <p className="text-[10px] text-gray-400">Super Administrator</p>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                   <img src="/api/placeholder/40/40" alt="admin-avatar" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Title Section */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#E9652B] uppercase tracking-widest mb-1">Admin Dashboard</p>
            <h3 className="text-2xl font-black text-gray-800">ภาพรวมระบบจัดการคำร้อง</h3>
            <p className="text-xs text-gray-400 mt-1">ข้อมูลสรุปสถานะการดำเนินงานและสถิติคำร้องประจำวัน</p>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            <Download size={14} className="mr-2" /> Export CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40`}>
              <span className={`text-xs font-bold ${stat.textColor === 'text-white' ? 'text-white/80' : 'text-gray-400'}`}>{stat.label}</span>
              <div>
                <p className={`text-4xl font-black ${stat.textColor}`}>{stat.value}</p>
                <p className={`text-[10px] mt-1 ${stat.textColor === 'text-white' ? 'text-white/60' : 'text-gray-300'}`}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Requests Table Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800">คำร้องที่ใหม่ที่รอดำเนินการ</h4>
            <button className="text-xs font-bold text-orange-500 flex items-center hover:underline">
              ดูทั้งหมด <ChevronRight size={14} className="ml-1" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="px-6 py-4 font-bold">Ref Code</th>
                  <th className="px-6 py-4 font-bold">ประเภท</th>
                  <th className="px-6 py-4 font-bold">หัวข้อ</th>
                  <th className="px-6 py-4 font-bold">ผู้แจ้ง</th>
                  <th className="px-6 py-4 font-bold">สถานที่</th>
                  <th className="px-6 py-4 font-bold">สถานะ</th>
                  <th className="px-6 py-4 font-bold text-center">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-orange-500">{req.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2 text-gray-400">{req.icon}</span> {req.type}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{req.title}</p>
                        <p className="text-[10px] text-gray-300">{req.asset}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-gray-700">{req.sender}</p>
                        <p className="text-[10px] text-gray-400">{req.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-500 font-medium">{req.location}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold flex items-center w-fit ${req.statusColor}`}>
                        <div className={`w-1 h-1 rounded-full mr-1.5 ${req.statusColor.split(' ')[0].replace('text', 'bg')}`} />
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-400 text-center">{req.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-orange-50 text-[#E9652B] font-bold' : 'text-gray-400 hover:bg-gray-50'
  }`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

export default AdminDashboard;