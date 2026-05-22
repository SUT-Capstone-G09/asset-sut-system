import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmSaveModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "ยืนยันการบันทึกข้อมูล", 
  message = "คุณต้องการบันทึกการเปลี่ยนแปลงสถานะและเจ้าหน้าที่ผู้รับผิดชอบใช่หรือไม่?" 
}: ConfirmModalProps) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={44} />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-3">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">
            {message}
          </p>

          <div className="flex flex-col w-full space-y-3">
            {/* Confirm Button */}
            <button 
              onClick={onConfirm}
              className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              ยืนยันการบันทึก
            </button>

            {/* Cancel Button */}
            <button 
              onClick={onClose}
              className="w-full bg-white text-slate-400 font-bold py-3 hover:text-slate-600 transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaveModal;