import React from 'react';
import { Map as MapIcon, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

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

export default function ContactMapCard() {
  return (
    <div className="lg:col-span-5 flex flex-col">
      <div className="bg-[#1E293B] text-white rounded-md shadow-xl overflow-hidden flex flex-col h-full border border-slate-800">
        {/* Map Header */}
        <div className="px-6 py-4 bg-slate-900/50 flex justify-between items-center border border-slate-800">
          <div className="flex items-center space-x-2 font-bold text-sm tracking-wide">
            <MapIcon size={16} className="text-orange-500" />
            <span>Asset Map</span>
          </div>
          <a 
            href="https://www.google.com/maps/place/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3+%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B9%80%E0%B8%97%E0%B8%84%E0%B9%82%E0%B8%99%E0%B9%82%E0%B8%A5%E0%B8%A2%E0%B8%B5%E0%B8%AA%E0%B8%B8%E0%B8%A3%E0%B8%99%E0%B8%B2%E0%B8%A3%E0%B8%B5/@14.8808124,102.0209532,17.89z" 
            target="_blank" 
            rel="noreferrer"
            className="bg-white/10 hover:bg-white/20 text-xs font-medium px-3 py-1.5 rounded-md flex items-center transition-all"
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
  );
}
