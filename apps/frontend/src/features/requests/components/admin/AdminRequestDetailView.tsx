"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import {
  ArrowLeft, Bell, Settings, User, MapPin,
  Calendar, FileText, Send, Paperclip, ChevronDown, Download, AlertCircle, X,
  LayoutDashboard, ClipboardList, PlusCircle
} from 'lucide-react';
import ConfirmSaveModal from './ConfirmSaveModal';
import { apiClient } from "@/lib/services/api-client";
import {
  DEFAULT_ADMIN_REQUESTS,
  DEFAULT_ADMIN_INQUIRIES,
} from "../../data/adminRequestMock";

export default function AdminRequestDetailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState('pending');
  const [staffId, setStaffID] = useState<number>(2); // Default staff (กฤษณะ)
  const [noteDetail, setNoteDetail] = useState('ปรับปรุงสถานะและดำเนินการประสานงานช่าง');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Dynamic state for real DB request
  const [realRequest, setRealRequest] = useState<any>(null);
  const [realHistories, setRealHistories] = useState<any[]>([]);
  const [realMessages, setRealMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const requestId = searchParams.get('id') || 'REF-2024-089';

  // Check if it's a mock item
  const mockRequest = DEFAULT_ADMIN_REQUESTS.find(r => r.id === requestId);
  const mockInquiry = DEFAULT_ADMIN_INQUIRIES.find(i => i.id === requestId);
  const isMock = !!(mockRequest || mockInquiry || requestId === 'REF-2024-089');

  // Fetch real data if it is not mock
  useEffect(() => {
    if (!isMounted || isMock) return;

    const fetchRealDetail = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<any>(`/requests/${requestId}`);
        if (response && response.request) {
          setRealRequest(response.request);
          setRealHistories(response.histories || []);
          setRealMessages(response.messages || []);
          
          // Map DB status back to selection
          const dbStatus = response.request.status?.status;
          if (dbStatus) {
            const s = dbStatus.toLowerCase();
            if (s === 'pending') setStatus('pending');
            else if (s === 'in_progress' || s === 'in progress') setStatus('in_progress');
            else if (s === 'completed' || s === 'resolved') setStatus('completed');
            else if (s === 'cancelled') setStatus('cancelled');
            else if (s === 'reject') setStatus('reject');
          }
          if (response.request.staff_id) {
            setStaffID(response.request.staff_id);
          }
        }
      } catch (error) {
        console.error("Error fetching real request detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealDetail();
  }, [isMounted, requestId, isMock]);

  // Initialize status from mock data once mounted
  useEffect(() => {
    if (isMounted && isMock) {
      if (mockRequest) {
        setStatus(mockRequest.status === 'URGENT' ? 'Urgent' : mockRequest.status === 'IN-PROGRESS' ? 'In Progress' : 'Resolved');
      } else if (mockInquiry) {
        setStatus(mockInquiry.status === 'unread' ? 'Pending' : 'Resolved');
      } else {
        setStatus('In Progress');
      }
    }
  }, [isMounted, requestId, isMock]);

  const handleSaveClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsConfirmOpen(false);
    
    if (!isMock) {
      setIsLoading(true);
      try {
        const payload = {
          status: status, // "Pending", "In Progress", "Resolved"
          staff_id: staffId > 0 ? staffId : null,
          detail: noteDetail
        };
        await apiClient.put(`/requests/${requestId}`, payload);
        alert(`บันทึกสถานะใหม่เป็น "${status}" และมอบหมายงานสำเร็จ!`);
        
        // Re-fetch request details
        const response = await apiClient.get<any>(`/requests/${requestId}`);
        if (response) {
          setRealRequest(response.request);
          setRealHistories(response.histories || []);
          setRealMessages(response.messages || []);
        }
      } catch (error: any) {
        console.error("Error updating request:", error);
        alert(`เกิดข้อผิดพลาดในการอัปเดต: ${error?.message || "ไม่ทราบสาเหตุ"}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Saving changes for mock status:", status);
      alert(`[MOCK] บันทึกสถานะใหม่เป็น "${status}" สำเร็จ!`);
    }
  };

  const getStatusBadgeStyle = (s: string) => {
    switch (s) {
      case 'reject': return 'bg-red-50 text-red-500';
      case 'in_progress': return 'bg-blue-50 text-blue-500';
      case 'completed': return 'bg-green-50 text-green-600';
      case 'cancelled': return 'bg-slate-100 text-slate-400';
      case 'pending':
      default: return 'bg-yellow-50 text-yellow-600';
    }
  };

  const getStatusThaiLabel = (s: string) => {
    switch (s) {
      case 'reject': return 'ปฏิเสธ';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      case 'pending':
      default: return 'รอดำเนินการ';
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-slate-500 font-bold text-lg animate-pulse">กำลังโหลดรายละเอียดคำร้อง...</div>
      </div>
    );
  }

  // Determine actual display values based on lookup results (DB vs. Mock)
  let displayId = 'REF-2024-089';
  let displayTitle = 'พบปัญหาท่อน้ำแตกบริเวณชั้น 2 อาคารบรรณสาร (Library)';
  let displayDesc = 'มีน้ำรั่วซึมไหลออกมาจากเพดานบริเวณโซนที่นั่งอ่านหนังสือเงียบ ชั้น 3 ใกล้กับจุดปลั๊กไฟ รบกวนรีบดำเนินการตรวจสอบก่อนที่จะส่งผลเสียต่อสินทรัพย์และหนังสือจะเสียหาย';
  let displayLocation = 'อาคารบรรณสาร (ชั้น 3)';
  let displayDate = '24 Oct 2024, 14:30';
  let displayType = 'แจ้งซ่อมบำรุง';
  let displaySender = 'NALINEE J.';
  let chatBubbles = [
    { name: 'NALINEE J.', time: '14:35', text: 'แจ้งเพิ่มเติมค่ะ ตรงบริเวณที่แตกมีปลั๊กไฟอยู่ใกล้ๆ ด้วยค่ะ', isAdmin: false },
    { name: 'ADMIN SOMSAK', time: '14:40', text: 'รับทราบครับ กำลังประสานงานช่างอาคารที่ดูแลโซนบรรณสารให้รีบเข้าไปตรวจสอบด่วนครับ', isAdmin: true }
  ];

  if (!isMock && realRequest) {
    displayId = realRequest.refcode;
    displayTitle = realRequest.title;
    displayDesc = realRequest.description;
    displayLocation = realRequest.location;
    
    // Format date
    try {
      const dateObj = new Date(realRequest.created_at);
      const year = dateObj.getFullYear() + 543;
      displayDate = dateObj.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short"
      }) + ` ${year % 100}, ` + dateObj.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      displayDate = realRequest.created_at;
    }
    
    displayType = realRequest.request_type?.name || "ซ่อมบำรุง";
    displaySender = realRequest.user?.profile ? `${realRequest.user.profile.first_name} ${realRequest.user.profile.last_name}` : realRequest.contact_info;
    
    // Map chat messages
    if (realMessages && realMessages.length > 0) {
      chatBubbles = realMessages.map(msg => ({
        name: msg.is_staff ? (msg.user?.profile?.first_name || "เจ้าหน้าที่") : (realRequest.user?.profile?.first_name || "ผู้แจ้ง"),
        time: new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        text: msg.message,
        isAdmin: msg.is_staff
      }));
    } else {
      chatBubbles = [];
    }
  } else if (mockRequest) {
    displayId = mockRequest.id;
    displayTitle = mockRequest.title;
    displayDesc = `ขอแจ้งเรื่อง ${mockRequest.title} ของหมายเลขสินทรัพย์ ${mockRequest.asset} ณ สถานที่ ${mockRequest.location} กรุณาส่งเจ้าหน้าที่ฝ่ายที่เกี่ยวข้องเข้าดำเนินการตรวจสอบและซ่อมบำรุงโดยด่วน`;
    displayLocation = mockRequest.location;
    displayDate = mockRequest.date;
    displayType = mockRequest.type;
    displaySender = mockRequest.sender;
    chatBubbles = [
      { name: mockRequest.sender, time: '10:00 น.', text: `สวัสดีครับ ขอแจ้งตรวจสอบเรื่อง ${mockRequest.title} ของสินทรัพย์ ${mockRequest.asset} ครับ`, isAdmin: false },
      { name: 'SYSTEM AUTOMATIC', time: '10:05 น.', text: `ระบบทำการรับเรื่องคำร้องหมายเลข ${mockRequest.id} เข้าสู่กระบวนการแล้ว`, isAdmin: true }
    ];
  } else if (mockInquiry) {
    displayId = mockInquiry.id;
    displayTitle = mockInquiry.subject;
    displayDesc = mockInquiry.detail;
    displayLocation = 'ไม่ได้ระบุสถานที่';
    displayDate = mockInquiry.date;
    displayType = mockInquiry.type;
    displaySender = mockInquiry.name;
    chatBubbles = [
      { name: mockInquiry.name, time: '16:18 น.', text: mockInquiry.detail, isAdmin: false },
      { name: 'SYSTEM AUTOMATIC', time: '16:20 น.', text: `ระบบรับข้อมูลคำถามเรื่อง "${mockInquiry.subject}" จากคุณ ${mockInquiry.name} เรียบร้อยแล้ว`, isAdmin: true }
    ];
  }

  return (
    <div className="flex min-h-screen font-sans w-full bg-[#F8F9FB]">
      {/* Confirm Modal */}
      <ConfirmSaveModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <div className="flex-1">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            {/* Left Content */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${getStatusBadgeStyle(status)}`}>{getStatusThaiLabel(status)}</span>
                  <span className="text-slate-400 font-bold text-sm">{displayId}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 leading-tight mb-4">{displayTitle}</h1>
                <p className="text-slate-500 text-lg leading-relaxed">{displayDesc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <InfoSmall icon={<MapPin className="text-orange-500" />} label="สถานที่" value={displayLocation} />
                <InfoSmall icon={<Calendar className="text-orange-500" />} label="วันที่แจ้ง" value={displayDate} />
                <InfoSmall icon={<FileText className="text-orange-500" />} label="ประเภท" value={displayType} />
              </div>

              <div>
                <h4 className="font-black text-slate-800 mb-4 flex items-center"><Paperclip size={18} className="mr-2" /> ไฟล์แนบและหลักฐาน</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {chatBubbles.length > 0 ? (
                    chatBubbles.map((chat, index) => (
                      <ChatBubble key={index} name={chat.name} time={chat.time} text={chat.text} isAdmin={chat.isAdmin} />
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs">ยังไม่มีประวัติการสนทนาสำหรับคำร้องนี้</div>
                  )}
                </div>
                <div className="flex items-center space-x-3 bg-slate-100 p-3 rounded-2xl">
                  <input type="text" placeholder="พิมพ์ข้อความตอบกลับผู้แจ้ง..." className="bg-transparent flex-1 text-sm outline-none px-2" />
                  <Paperclip size={18} className="text-slate-400 cursor-pointer" />
                  <button className="bg-orange-500 text-white p-2 rounded-xl"><Send size={16} /></button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Status Update */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
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
                        <option value="pending">รอดำเนินการ (Pending)</option>
                        <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                        <option value="completed">เสร็จสิ้น (Completed)</option>
                        <option value="cancelled">ยกเลิก (Cancelled)</option>
                        <option value="reject">ปฏิเสธ (Reject)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">มอบหมายเจ้าหน้าที่</label>
                    <div className="relative">
                      <select 
                        value={staffId}
                        onChange={(e) => setStaffID(Number(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 appearance-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value={2}>นายกฤษณะ สุขสวัสดิ์ (ช่างทั่วไป)</option>
                        <option value={0}>ไม่ได้มอบหมาย</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">บันทึกเพิ่มเติม (Activity Note)</label>
                    <input 
                      type="text" 
                      value={noteDetail}
                      onChange={(e) => setNoteDetail(e.target.value)}
                      placeholder="บันทึกรายละเอียดเพิ่มเติม..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white transition-all font-medium text-slate-700"
                    />
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
                <h4 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-sm">Activity Log (ประวัติกิจกรรม)</h4>
                <div className="space-y-6">
                  {!isMock && realHistories.length > 0 ? (
                    realHistories.map((h: any, index: number) => {
                      // Calculate time display
                      let timeStr = "เมื่อสักครู่";
                      try {
                        const dateObj = new Date(h.created_at);
                        const year = dateObj.getFullYear() + 543;
                        timeStr = dateObj.toLocaleDateString("th-TH", { day: 'numeric', month: 'short' }) + ` ${year % 100} • ${dateObj.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}`;
                      } catch (e) {
                        timeStr = h.created_at;
                      }

                      return (
                        <LogItem 
                          key={h.id || index}
                          user={h.admin?.profile ? `${h.admin.profile.first_name} ${h.admin.profile.last_name}` : "ระบบ"} 
                          action={`เปลี่ยนสถานะเป็น ${h.status?.status === "in_progress" ? "In Progress" : h.status?.status === "completed" || h.status?.status === "resolved" ? "Resolved" : "Pending"}${h.detail ? `: ${h.detail}` : ""}`} 
                          time={timeStr} 
                        />
                      );
                    })
                  ) : (
                    <>
                      <LogItem user="Admin Somsak" action="มอบหมายงานให้ นายวัชรินทร์ แสนอ่อน" time="15 MINS AGO" />
                      <LogItem user="System Automatic" action="เปลี่ยนสถานะเป็น In Progress" time="18 MINS AGO" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

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
