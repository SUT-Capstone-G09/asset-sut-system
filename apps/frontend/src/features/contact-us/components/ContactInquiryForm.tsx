import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/auth-context';
import { MessageSquareText, Send } from 'lucide-react';

interface ContactInquiryFormProps {
  mounted: boolean;
}

export default function ContactInquiryForm({ mounted }: ContactInquiryFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    detail: ''
  });

  useEffect(() => {
    if (mounted && user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || `${user.first_name} ${user.last_name}`.trim(),
        email: prev.email || user.email || '',
      }));
    }
  }, [mounted, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting inquiry data:", formData);
    // Logic สำหรับส่งอีเมล หรือบันทึกข้อมูลติดต่อสอบถาม
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100 h-full relative overflow-hidden">
        {/* Overlay if not logged in */}
        {mounted && !user && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border border-slate-100 space-y-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <MessageSquareText size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">กรุณาเข้าสู่ระบบ</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  กรุณาเข้าสู่ระบบเพื่อใช้บริการส่งข้อความติดต่อสอบถามรายละเอียด
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-200 cursor-pointer"
              >
                เข้าสู่ระบบเพื่อติดต่อเรา
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 mb-6">
          <MessageSquareText size={22} className="text-orange-500" />
          <h2 className="text-xl font-black text-slate-800">ส่งข้อความติดต่อสอบถาม</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-[11px] font-bold text-red-500">* จำเป็นต้องกรอกข้อมูล</p>
          
          {/* Name & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input 
                type="text" 
                placeholder="ชื่อ - นามสกุล *" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <input 
                type="tel" 
                placeholder="เบอร์โทรศัพท์ *" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <input 
              type="email" 
              placeholder="อีเมล *" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Subject Input */}
          <div>
            <input 
              type="text" 
              placeholder="เรื่องที่ต้องการติดต่อสอบถาม *" 
              required
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Detail Textarea */}
          <div>
            <textarea 
              rows={4}
              placeholder="กรุณาระบุรายละเอียดข้อความของคุณ... *" 
              required
              value={formData.detail}
              onChange={(e) => setFormData({...formData, detail: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            <span>ส่งข้อความ</span>
            <Send size={16} className="transform rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
}
