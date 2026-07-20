"use client";

import React from "react";
import { Info, User, Building, MapPin } from "lucide-react";
import { MockTenant, MockContract } from "@/features/space-rental/data/mock-tenants";

interface OperatorShopInfoTabProps {
  activeTenant: MockTenant;
  activeContract: MockContract;
  areaName: string;
}

export default function OperatorShopInfoTab({
  activeTenant,
  activeContract,
  areaName,
}: OperatorShopInfoTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeTenant.name}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200/60">
              <span className="size-2 rounded-full animate-pulse bg-blue-500" />
              เช่าแล้ว (Occupied)
            </span>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Area Code: <span className="text-slate-600 font-black">{activeTenant.id.split("-").pop()?.toUpperCase() || "N/A"}</span>
          </p>
        </div>
        
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-[7px] px-3.5 py-2">
          <Info size={13} />
          โหมดดูข้อมูลเท่านั้น (Read-Only)
        </span>
      </div>

      {/* Gallery image container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative w-full h-[280px] rounded-[7px] overflow-hidden border border-slate-150 shadow-inner bg-slate-50 flex items-center justify-center">
          <img
            src={activeTenant.bannerUrl || "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg"}
            alt="Shop Space image"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Owner Profile Panel */}
        <div className="bg-white rounded-[7px] border border-slate-100 p-5 space-y-4 shadow-sm flex flex-col justify-center">
          <div className="text-center pb-2 border-b border-slate-50">
            <div className="size-14 rounded-full bg-[#f26522]/10 flex items-center justify-center mx-auto mb-2 text-[#f26522]">
              <User size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">{activeTenant.ownerName}</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">ผู้ประกอบการ / คู่สัญญา</p>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">เบอร์โทรศัพท์:</span>
              <span className="text-slate-700 font-bold">{activeTenant.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">เลขผู้เสียภาษี:</span>
              <span className="text-slate-700 font-bold">{activeTenant.taxId || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">เลขประจำตัวปชช:</span>
              <span className="text-slate-700 font-bold">{activeTenant.nationalId || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Overview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            ข้อมูลภาพรวมพื้นที่
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[7px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">รหัสตำแหน่ง</span>
            <span className="text-sm font-bold text-slate-700">{activeTenant.id.split("-").pop()?.toUpperCase()}</span>
          </div>
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[7px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ขนาดพื้นที่</span>
            <span className="text-sm font-bold text-slate-700">15 ตร.ม.</span>
          </div>
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[7px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ประเภทพื้นที่</span>
            <span className="text-sm font-bold text-slate-700">{areaName}</span>
          </div>
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[7px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">อัตราค่าเช่าเช่าพื้นฐาน</span>
            <span className="text-sm font-bold text-[#f26522]">{activeContract.monthlyRental.toLocaleString()} บ./ด.</span>
          </div>
        </div>
      </div>

      {/* 2. Location Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            ข้อมูลสถานที่ตั้ง
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 border border-slate-100 rounded-[7px] shadow-sm">
          <div className="space-y-3.5 text-sm">
            <div className="flex gap-2">
              <Building size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">{activeTenant.subLocation}</span>
                <span className="text-xs text-slate-400">มหาวิทยาลัยเทคโนโลยีสุรนารี</span>
              </div>
            </div>
            <div className="flex gap-2">
              <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">พิกัดทางภูมิศาสตร์ (GPS)</span>
                <span className="text-xs text-slate-500 font-mono">Lat: 14.8804616, Lng: 102.0161729</span>
              </div>
            </div>
          </div>
          <div className="h-[120px] rounded-[7px] overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px] opacity-70" />
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 z-10">
              <MapPin className="text-[#f26522]" size={14} />
              แผนที่จำลองอาคาร (SUT Map Coordinates)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Description & Terms */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#f26522] rounded-full shadow-[0_0_10px_rgba(242,101,34,0.25)]" />
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            เงื่อนไขและรายละเอียดเพิ่มเติม
          </h3>
        </div>
        
        <div className="bg-slate-50/40 p-5 rounded-[7px] border border-slate-100 text-sm leading-relaxed space-y-3">
          <div>
            <strong className="block text-xs uppercase tracking-wider text-slate-400 mb-1">เงื่อนไขการเช่าพื้นที่:</strong>
            <p className="text-slate-650 font-medium">{activeTenant.terms || "—"}</p>
          </div>
          <div className="pt-3 border-t border-slate-100">
            <strong className="block text-xs uppercase tracking-wider text-slate-400 mb-1">หมายเหตุระบบ:</strong>
            <p className="text-slate-650 font-medium">{activeTenant.note || "ไม่มีบันทึกข้อความเพิ่มเติม"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
