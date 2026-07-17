import React from 'react';
import { User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminInquiryItem {
  id: string;
  type: string;
  date: string;
  subject: string;
  detail: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

interface AdminInquiryListProps {
  inquiries: AdminInquiryItem[];
  inquirySubTab: string;
  handleInquiryClick: (id: string) => void;
}
// Filter ติดต่อสอบถาม
export const AdminInquiryList: React.FC<AdminInquiryListProps> = ({
  inquiries,
  inquirySubTab,
  handleInquiryClick,
}) => {
  const filteredInquiries = inquiries.filter(item => item.status === inquirySubTab);

  return (
    <div className="space-y-4">
      {filteredInquiries.map((inq) => (
        <div
          key={inq.id}
          className="bg-white rounded-md p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-6 hover:border-orange-200 transition-all animate-in fade-in duration-200"
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
                  className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-bold py-2 rounded-md text-xs shadow-md shadow-orange-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  ตอบกลับแชท <ArrowRight size={14} className="ml-1.5" />
                </button>
                <button className="w-full bg-slate-50 text-slate-500 py-2 rounded-md text-xs font-bold border hover:bg-slate-100 transition-colors cursor-pointer">
                  ส่งต่อสายช่าง
                </button>
              </>
            ) : (
              <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-md text-xs font-bold flex items-center">
                <CheckCircle2 size={14} className="mr-1.5" /> ตอบกลับแล้ว
              </span>
            )}
          </div>
        </div>
      ))}
      {filteredInquiries.length === 0 && (
        <div className="bg-white rounded-md p-12 text-center border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
          ไม่มีข้อความติดต่อสอบถามในหมวดหมู่นี้
        </div>
      )}
    </div>
  );
};
