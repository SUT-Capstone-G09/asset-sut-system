import React from 'react';
import { 
  ArrowLeft, Search, Bell, Settings, LayoutDashboard, 
  ClipboardList, PlusCircle, FileText, LogOut, MapPin, 
  Calendar, Paperclip, Send, CheckCircle2, MessageCircle, Clock 
} from 'lucide-react';

const RequestDetailPage = () => {
  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans text-slate-800">
      {/* Sidebar - สไตล์เดิม */}
      <aside className="w-64 bg-white border-r flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6">
          <h1 className="text-2xl font-black text-orange-600">Asset SUT</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Modern Concierge</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="แดชบอร์ด" />
          <NavItem icon={<ClipboardList size={18} />} label="รายการคำร้อง" />
          <NavItem icon={<PlusCircle size={18} />} label="แจ้งเรื่องใหม่" />
          <NavItem icon={<FileText size={18} />} label="ติดตามคำร้อง" active />
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center justify-center w-full py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all">
            <LogOut size={18} className="mr-2" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="font-bold text-orange-600">ส่วนบริหารสินทรัพย์ SUT</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500" size={16} />
              <input type="text" placeholder="ค้นหาเลขที่อ้างอิง..." className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div className="flex items-center space-x-2 border-l pl-6">
              <button className="p-2 text-slate-400 hover:text-orange-500"><Bell size={20} /></button>
              <button className="p-2 text-slate-400 hover:text-orange-500"><Settings size={20} /></button>
              <div className="w-8 h-8 bg-slate-800 rounded-lg ml-2"></div>
            </div>
          </div>
        </header>

        <main className="p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
          {/* Left Column: Request Info & Status */}
          <div className="col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded">ASSET-REQ</span>
                    <h3 className="text-3xl font-black text-slate-800">REF: #SUT-2024-0892</h3>
                  </div>
                  <div className="flex space-x-6 text-sm text-slate-400 font-medium">
                    <span className="flex items-center"><PlusCircle size={14} className="mr-2 text-orange-400" /> ประเภท: ซ่อมบำรุงครุภัณฑ์ไฟฟ้า</span>
                    <span className="flex items-center"><Clock size={14} className="mr-2 text-orange-400" /> วันที่สร้าง: 12 ต.ค. 2567 | 09:30 น.</span>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" /> กำลังดำเนินการ
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-slate-50 p-1.5 rounded-2xl w-fit">
                <button className="bg-white text-orange-600 px-6 py-2 rounded-xl text-sm font-bold shadow-sm">รายละเอียด</button>
                <button className="text-slate-400 px-6 py-2 rounded-xl text-sm font-bold hover:text-slate-600 transition-colors">ประวัติ</button>
                <button className="text-slate-400 px-6 py-2 rounded-xl text-sm font-bold hover:text-slate-600 transition-colors">เอกสารที่เกี่ยวข้อง</button>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-4" /> แจ้งซ่อมเครื่องปรับอากาศ ห้องบรรยาย B1102
              </h4>
              <p className="text-slate-500 leading-relaxed mb-10 text-lg">
                ตรวจสอบพบเครื่องปรับอากาศ หมายเลขครุภัณฑ์ SUT-AC-55-012 มีอาการเสียงดังผิดปกติและลมไม่เย็นจัดในช่วงเวลาที่มีนักศึกษาเข้าใช้งานหนาแน่น เบื้องต้นได้ทำความสะอาดแผ่นกรองแล้วแต่อาการยังไม่หาย คาดว่าอาจเกิดจากระบบน้ำยาหรือคอมเพรสเซอร์มีปัญหา
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">สถานที่เกิดเหตุ</span>
                  <div className="flex items-center font-bold text-slate-700">
                    <MapPin className="text-orange-500 mr-3" size={20} /> อาคารเรียนรวม 1 ชั้น 1 ห้องบรรยาย B1102
                  </div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">วันที่เกิดเหตุ</span>
                  <div className="flex items-center font-bold text-slate-700">
                    <Calendar className="text-orange-500 mr-3" size={20} /> 11 ตุลาคม 2567 (ประมาณ 14:00 น.)
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">ไฟล์แนบ (2 ไฟล์)</span>
                <div className="flex space-x-4">
                  <div className="w-32 h-32 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                    <img src="/api/placeholder/128/128" alt="attach-1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-32 h-32 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                    <img src="/api/placeholder/128/128" alt="attach-2" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Tracking Card */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8">สถานะการดำเนินการ</h4>
              <div className="space-y-0 relative">
                {/* Timeline Line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-100" />
                
                <StatusStep 
                  active 
                  done 
                  icon={<CheckCircle2 size={24} />} 
                  title="รับเรื่อง" 
                  desc="เจ้าหน้าที่รับเรื่องและตรวจสอบข้อมูลเบื้องต้นเรียบร้อยแล้ว" 
                  time="12 ต.ค. 67 • 09:45" 
                />
                <StatusStep 
                  active 
                  icon={<MessageCircle size={24} />} 
                  title="กำลังดำเนินการ" 
                  desc="ประสานงานช่างเทคนิคเพื่อเข้าตรวจสอบหน้างาน" 
                  time="12 ต.ค. 67 • 13:20" 
                  color="bg-orange-500"
                />
                <StatusStep 
                  icon={<CheckCircle2 size={24} />} 
                  title="เสร็จสิ้น" 
                  desc="รอการปิดงานจากผู้แจ้ง" 
                  time="" 
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Right Column: Chat System */}
          <div className="col-span-4 h-[calc(100vh-140px)] sticky top-28">
            <div className="bg-white rounded-[2.5rem] h-full shadow-xl border border-slate-100 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-6 border-b flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h5 className="font-black text-slate-800">ช่องทางติดต่อสอบถาม</h5>
                  <div className="flex items-center text-[10px] text-green-500 font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" /> ออนไลน์ (ฝ่ายเทคนิค)
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                <div className="text-center"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white px-4 py-1 rounded-full shadow-sm">วันนี้</span></div>
                
                {/* Staff Bubble */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-orange-400 ml-1">STAFF: สมชาย</span>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] text-sm leading-relaxed">
                    สวัสดีครับคุณผู้แจ้ง ผมได้รับเรื่องแจ้งซ่อมแล้วนะครับ ขณะนี้กำลังจัดคิวช่างเทคนิค คาดว่าจะเข้าตรวจสอบหน้างานได้พรุ่งนี้เช้าครับ
                    <div className="text-[9px] text-slate-300 mt-2 text-right">09:47 น.</div>
                  </div>
                </div>

                {/* User Bubble */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="bg-orange-500 text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-orange-100 max-w-[85%] text-sm leading-relaxed">
                    ขอบคุณครับ รบกวนช่างโทรแจ้งก่อนเข้าหน้างานด้วยนะครับ พอดีห้องบรรยายจะมีเรียนช่วง 10 โมงครับ
                    <div className="text-[9px] text-orange-200 mt-2 text-right">10:15 น. ✓</div>
                  </div>
                </div>

                {/* Staff Bubble */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-orange-400 ml-1">STAFF: สมชาย</span>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] text-sm leading-relaxed">
                    รับทราบครับ จะให้ช่างประสานงานก่อนเข้าครับ
                    <div className="text-[9px] text-slate-300 mt-2 text-right">10:18 น.</div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white border-t space-y-4">
                <textarea 
                  placeholder="พิมพ์ข้อความที่นี่..." 
                  className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  rows={2}
                />
                <div className="flex justify-between items-center">
                  <button className="flex items-center text-orange-500 font-bold text-xs hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors">
                    <Paperclip size={16} className="mr-2" /> แนบไฟล์
                  </button>
                  <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-orange-600 transition-all shadow-md">
                    ส่งข้อความ <Send size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="p-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          © 2024 SURANAREE UNIVERSITY OF TECHNOLOGY • ASSET MANAGEMENT DIVISION
        </footer>
      </div>
    </div>
  );
};

// UI Components
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
    active ? 'bg-orange-100 text-orange-600 font-bold' : 'text-slate-400 hover:bg-slate-50'
  }`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const StatusStep = ({ title, desc, time, icon, active = false, done = false, disabled = false, color = "bg-blue-500" }: any) => (
  <div className={`flex items-start space-x-6 pb-10 last:pb-0 ${disabled ? 'opacity-30' : 'opacity-100'}`}>
    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
      active ? `${color} text-white scale-110` : 'bg-slate-100 text-slate-400'
    }`}>
      {icon}
    </div>
    <div className="flex-1 pt-1">
      <div className="flex justify-between items-start">
        <h5 className={`font-black ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</h5>
        <span className="text-[10px] font-bold text-slate-300">{time}</span>
      </div>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
  </div>
);

export default RequestDetailPage;