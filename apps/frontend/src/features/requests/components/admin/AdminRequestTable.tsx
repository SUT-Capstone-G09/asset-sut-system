import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminRequestItem } from '../../domain/entities/admin-request-item.entity';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdminRequestTableProps {
  requests: AdminRequestItem[];
  handleRequestClick: (id: string) => void;
  getStatusStyle: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
}

export const AdminRequestTable: React.FC<AdminRequestTableProps> = ({
  requests,
  handleRequestClick,
  getStatusStyle,
  getStatusLabel,
  getTypeIcon,
}) => {
  return (
    <div className="bg-white rounded-md overflow-hidden border border-slate-100 shadow-sm">
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
            <th className="px-6 py-4 text-center">จัดการ</th>
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
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="size-8 rounded-lg text-slate-400 hover:bg-slate-100/80 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer" title="ดำเนินการ">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-ellipsis" aria-hidden="true">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRequestClick(req.id)} className="cursor-pointer">
                          เปิดจัดการ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
  );
};
