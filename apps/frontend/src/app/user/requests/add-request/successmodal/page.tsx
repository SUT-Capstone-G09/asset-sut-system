"use client"

import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop: ฉากหลังเบลอและมืดลงเล็กน้อย */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl shadow-slate-900/20 p-10 transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon (Optional: เพิ่มจากภาพเพื่อให้ดู Modern ขึ้น) */}
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-8">
            สร้างคำร้องสำเร็จ
          </h2>

          <div className="w-full space-y-4">
            {/* ปุ่มติดตามคำร้อง (Primary) */}
            <button 
              onClick={() => router.push('/requests/tracking')} // ลิงก์ไปยังหน้าติดตาม
              className="w-full bg-[#F26522] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              ติดตามคำร้อง
            </button>

            {/* ปุ่มสร้างคำร้องใหม่ (Secondary) */}
            <button 
              onClick={onClose}
              className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              สร้างคำร้อง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;