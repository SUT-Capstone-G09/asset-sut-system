import React from 'react';
import { MessageSquareText } from 'lucide-react';

export default function ContactHeader() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
        <MessageSquareText size={14} />
        <span>Contact Us</span>
      </div>
      <h1 className="text-4xl font-black text-slate-800">ติดต่อสอบถามข้อมูล</h1>
      <p className="text-slate-400 text-sm mt-2">หากมีข้อสงสัยเกี่ยวกับสินทรัพย์ การใช้งานพื้นที่ หรือสัญญาเช่า สามารถส่งข้อความหาเราได้ทันที</p>
    </div>
  );
}
