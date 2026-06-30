"use client";

import React, { useState } from 'react';
import { MessageCircle, Paperclip, Send } from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderType: 'staff' | 'user';
  senderName?: string;
  content: string;
  time: string;
  read?: boolean;
}

interface RequestDetailChatProps {
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void;
  onAttachFile?: () => void;
  statusOnlineText?: string;
}

export default function RequestDetailChat({
  messages,
  onSendMessage,
  onAttachFile,
  statusOnlineText = "ออนไลน์ (ฝ่ายเทคนิค)",
}: RequestDetailChatProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    if (onSendMessage) {
      onSendMessage(text);
    }
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] h-full shadow-xl border border-slate-100 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b flex items-center space-x-4 shrink-0">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
          <MessageCircle size={24} />
        </div>
        <div>
          <h5 className="font-black text-slate-800">ช่องทางติดต่อสอบถาม</h5>
          <div className="flex items-center text-[10px] text-green-500 font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" /> {statusOnlineText}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white px-4 py-1 rounded-full shadow-sm">
            วันนี้
          </span>
        </div>

        {messages.map((msg) => {
          if (msg.senderType === 'staff') {
            return (
              <div key={msg.id} className="space-y-2">
                <span className="text-[10px] font-black text-orange-400 ml-1">
                  STAFF: {msg.senderName || 'เจ้าหน้าที่'}
                </span>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] text-sm leading-relaxed text-slate-700">
                  {msg.content}
                  <div className="text-[9px] text-slate-300 mt-2 text-right">{msg.time}</div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-2">
                <div className="bg-orange-500 text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-orange-100 max-w-[85%] text-sm leading-relaxed">
                  {msg.content}
                  <div className="text-[9px] text-orange-200 mt-2 text-right">
                    {msg.time} {msg.read && '✓'}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-white border-t space-y-4 shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความที่นี่..."
          className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 resize-none text-slate-800 placeholder-slate-400"
          rows={2}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={onAttachFile}
            type="button"
            className="flex items-center text-orange-500 font-bold text-xs hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Paperclip size={16} className="mr-2" /> แนบไฟล์
          </button>
          <button
            onClick={handleSend}
            type="button"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-orange-600 transition-all shadow-md cursor-pointer"
          >
            ส่งข้อความ <Send size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
