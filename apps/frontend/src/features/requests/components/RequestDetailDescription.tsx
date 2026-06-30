"use client";

import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

interface RequestDetailDescriptionProps {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  attachments?: string[];
}

export default function RequestDetailDescription({
  title,
  description,
  location,
  eventDate,
  attachments = [],
}: RequestDetailDescriptionProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center">
        <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-4" /> {title}
      </h4>
      <p className="text-slate-500 leading-relaxed mb-10 text-lg">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            สถานที่เกิดเหตุ
          </span>
          <div className="flex items-center font-bold text-slate-700">
            <MapPin className="text-orange-500 mr-3 shrink-0" size={20} /> {location}
          </div>
        </div>
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            วันที่เกิดเหตุ
          </span>
          <div className="flex items-center font-bold text-slate-700">
            <Calendar className="text-orange-500 mr-3 shrink-0" size={20} /> {eventDate}
          </div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
            ไฟล์แนบ ({attachments.length} ไฟล์)
          </span>
          <div className="flex flex-wrap gap-4">
            {attachments.map((src, index) => (
              <div
                key={index}
                className="w-32 h-32 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-md"
              >
                <img
                  src={src}
                  alt={`attach-${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
