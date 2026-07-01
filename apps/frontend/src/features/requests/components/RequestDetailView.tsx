"use client";

import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Clock } from 'lucide-react';
import RequestDetailHeader from './RequestDetailHeader';
import RequestDetailDescription from './RequestDetailDescription';
import RequestDetailStatus, { StatusStepData } from './RequestDetailStatus';
import RequestDetailChat, { ChatMessage } from './RequestDetailChat';

import {
  DEFAULT_REQUEST_INFO,
  DEFAULT_STATUS_STEPS,
  DEFAULT_CHAT_MESSAGES
} from '../mock/requestDetailMock';

export default function RequestDetailView() {
  const [activeTab, setActiveTab] = useState('details');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEFAULT_CHAT_MESSAGES);

  const handleSendMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderType: 'user',
      content,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      read: false
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleAttachFile = () => {
    alert('ระบบแนบไฟล์ยังไม่เปิดให้บริการขณะนี้');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full items-start">
      {/* Left Column: Request Info & Status */}
      <div className="col-span-1 lg:col-span-8 space-y-6">
        <RequestDetailHeader
          refNumber={DEFAULT_REQUEST_INFO.refNumber}
          category={DEFAULT_REQUEST_INFO.category}
          createdAt={DEFAULT_REQUEST_INFO.createdAt}
          status={DEFAULT_REQUEST_INFO.status}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === 'details' && (
          <>
            <RequestDetailDescription
              title={DEFAULT_REQUEST_INFO.title}
              description={DEFAULT_REQUEST_INFO.description}
              location={DEFAULT_REQUEST_INFO.location}
              eventDate={DEFAULT_REQUEST_INFO.eventDate}
              attachments={DEFAULT_REQUEST_INFO.attachments}
            />
            <RequestDetailStatus steps={DEFAULT_STATUS_STEPS} />
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-4" /> ประวัติการดำเนินงาน
            </h4>
            <div className="space-y-6 mt-4 pl-4">
              {/* จุดที่ 2: ล่าสุด */}
              <div className="flex items-start space-x-4 relative">
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-gray-200"></div> {/* เส้นเชื่อม */}
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center z-10 text-xs">
                  🔄
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">เปลี่ยนสถานะเป็น "กำลังดำเนินการ"</p>
                  <p className="text-xs text-gray-400 mt-0.5">12 ต.ค. 2567 • 13:20 น. — โดย Admin สมชาย</p>
                  <p className="text-xs text-gray-505 bg-gray-50 p-2 rounded-lg mt-2 border border-gray-100">
                    "ประสานงานช่างเทคนิคเพื่อเตรียมเข้าตรวจสอบหน้างานเรียบร้อยแล้ว"
                  </p>
                </div>
              </div>

              {/* จุดที่ 1: เริ่มต้น */}
              <div className="flex items-start space-x-4 relative">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center z-10 text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">สร้างคำร้องใหม่สำเร็จ</p>
                  <p className="text-xs text-gray-400 mt-0.5">12 ต.ค. 2567 • 09:30 น. — โดย ผู้ใช้งาน (โหมดผู้เยี่ยมชม)</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Chat System */}
      <div className="col-span-1 lg:col-span-4 h-[600px] lg:h-[calc(100vh-180px)] lg:sticky lg:top-28">
        <RequestDetailChat
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onAttachFile={handleAttachFile}
        />
      </div>
    </div>
  );
}
