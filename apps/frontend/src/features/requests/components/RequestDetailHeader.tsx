"use client";

import React from 'react';
import { PlusCircle, Clock } from 'lucide-react';

interface RequestDetailHeaderProps {
  refNumber: string;
  category: string;
  createdAt: string;
  status: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function RequestDetailHeader({
  refNumber,
  category,
  createdAt,
  status,
  activeTab,
  setActiveTab,
}: RequestDetailHeaderProps) {
  const tabs = [
    { id: 'details', label: 'รายละเอียด' },
    { id: 'history', label: 'ประวัติ' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded">
              ASSET-REQ
            </span>
            <h3 className="text-3xl font-black text-slate-800">REF: #{refNumber}</h3>
          </div>
          <div className="flex space-x-6 text-sm text-slate-400 font-medium">
            <span className="flex items-center">
              <PlusCircle size={14} className="mr-2 text-orange-400" /> ประเภท: {category}
            </span>
            <span className="flex items-center">
              <Clock size={14} className="mr-2 text-orange-400" /> วันที่สร้าง: {createdAt}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" /> {status}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 transition-colors'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
