"use client";

import React from 'react';

export interface StatusStepData {
  title: string;
  desc: string;
  time?: string;
  icon: React.ReactNode;
  active?: boolean;
  done?: boolean;
  disabled?: boolean;
  color?: string;
}

interface RequestDetailStatusProps {
  steps: StatusStepData[];
}

const StatusStep = ({
  title,
  desc,
  time,
  icon,
  active = false,
  disabled = false,
  color = "bg-blue-500",
}: StatusStepData) => (
  <div className={`flex items-start space-x-6 pb-10 last:pb-0 ${disabled ? 'opacity-30' : 'opacity-100'}`}>
    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
      active ? `${color} text-white scale-110` : 'bg-slate-100 text-slate-400'
    }`}>
      {icon}
    </div>
    <div className="flex-1 pt-1">
      <div className="flex justify-between items-start">
        <h5 className={`font-black ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</h5>
        <span className="text-[10px] font-bold text-slate-300">{time}</span>
      </div>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
  </div>
);

export default function RequestDetailStatus({ steps }: RequestDetailStatusProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
      <h4 className="text-xl font-black text-slate-800 mb-8">สถานะการดำเนินการ</h4>
      <div className="space-y-0 relative">
        {/* Timeline Line */}
        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-100" />

        {steps.map((step, index) => (
          <StatusStep
            key={index}
            title={step.title}
            desc={step.desc}
            time={step.time}
            icon={step.icon}
            active={step.active}
            done={step.done}
            disabled={step.disabled}
            color={step.color}
          />
        ))}
      </div>
    </div>
  );
}
