import React from 'react';
import { PlusCircle } from 'lucide-react';

interface UserWelcomeBannerProps {
  displayName: string;
  onNewRequestClick: () => void;
}

export const UserWelcomeBanner: React.FC<UserWelcomeBannerProps> = ({
  displayName,
  onNewRequestClick,
}) => {
  return (
    <div className="bg-white rounded-md p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">สวัสดี, คุณ {displayName}</h2>
        <p className="text-slate-400 text-sm mt-1">สร้างคำร้อง หรือจัดส่งข้อความประสานงานติดต่อสอบถามของคุณทั้งหมดได้ที่นี่</p>
      </div>
      <div className="flex gap-3 shrink-0 w-full md:w-auto">
        <button 
          onClick={onNewRequestClick}
          className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-md flex items-center justify-center transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
        >
          <PlusCircle size={18} className="mr-2" /> แจ้งเรื่องใหม่
        </button>
      </div>
    </div>
  );
};
