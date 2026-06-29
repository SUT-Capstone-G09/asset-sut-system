"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/auth-context';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquareText, 
  Map as MapIcon,
  ExternalLink,
  Send
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

const ContactMap = dynamic(
  () => import('@/components/map/ContactMap'),
  {  
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-400">
        <p className="text-sm font-medium animate-pulse">กำลังโหลดแผนที่...</p>
      </div>
    )
  }
);

const ContactAndInquiryPage = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    detail: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Top Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
            <MessageSquareText size={14} />
            <span>Contact Us</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800">ติดต่อสอบถามข้อมูล</h1>
          <p className="text-slate-400 text-sm mt-2">หากมีข้อสงสัยเกี่ยวกับสินทรัพย์ การใช้งานพื้นที่ หรือสัญญาเช่า สามารถส่งข้อความหาเราได้ทันที</p>
        </div>

        {/* 2-Column Grid Layout: Map & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Left Column: Asset Map Card (4 คอลัมน์) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-[#1E293B] text-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col h-full border border-slate-800">
              {/* Map Header */}
              <div className="px-6 py-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center space-x-2 font-bold text-sm tracking-wide">
                  <MapIcon size={16} className="text-orange-500" />
                  <span>Asset Map</span>
                </div>
                <a 
                  href="https://maps.google.com/?q=14.8817715,102.0206962" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-xs font-medium px-3 py-1.5 rounded-xl flex items-center transition-all"
                >
                  เปิดใน Maps <ExternalLink size={12} className="ml-1.5" />
                </a>
              </div>
              
              {/* Map Container */}
              <div className="flex-1 bg-slate-800 relative min-h-[350px] lg:min-h-[auto] overflow-hidden">
                <ContactMap />
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card (7 คอลัมน์) */}
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
        </div>

        {/* Bottom Section: Footer Contact Info Cards (4 แถวตามตัวอย่าง) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
          
          {/* 1. สำนักงาน */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
              <MapPin size={16} />
              <h4>สำนักงาน</h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              อาคารบริหาร ชั้น 1 มหาวิทยาลัยเทคโนโลยีสุรนารี 111 ถ.มหาวิทยาลัย ต.สุรนารี อ.เมือง จ.นครราชสีมา 30000
            </p>
          </div>

          {/* 2. เวลาทำการ */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
              <Clock size={16} />
              <h4>เวลาทำการ</h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              วันจันทร์ – วันศุกร์ <br />
              เวลา 08:30 – 16:30 น.
            </p>
          </div>

          {/* 3. หมายเลขโทรศัพท์ */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
              <Phone size={16} />
              <h4>หมายเลขโทรศัพท์</h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              044-224-945 <br />
              เบอร์มือถือภายใน : 4945
            </p>
          </div>

          {/* 4. อีเมล */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
              <Mail size={16} />
              <h4>อีเมล</h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              damtsut@g.sut.ac.th <br />
              asset.sut@gmail.com
            </p>
          </div>

        </div>

      </main>
    </PageContainer>
  );
};

export default ContactAndInquiryPage;