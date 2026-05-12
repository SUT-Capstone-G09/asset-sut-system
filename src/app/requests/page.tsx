"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  PlusCircle,
  LogOut,
  Search,
  Clock,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";


const RequestsPage = () => {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] mt-20">

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <div className='mb-4'>
          <AssetBreadcrumb
            items={[
              { label: "หน้าหลัก", href: "/" },
              { label: "ติดต่อเรา" }
            ]}
          />
        </div>
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-gray-500 mt-1">เข้าสู่ระบบเพื่อสร้างและติดตามสถานะคำร้องของท่าน</p>
          </div>

          <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium flex items-center hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
            onClick={() => router.push('/login')}>
            <LogOut size={20} className="mr-2 rotate-180" />
            เข้าสู่ระบบ
          </button>
        </div>

        {/* Tracking Section */}
        <div className="mb-6 flex items-center">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></div>
          <h3 className="text-xl font-semibold text-gray-800">
            รายการ <span className="text-orange-500">คำร้องของท่าน</span>
          </h3>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 mb-8 flex flex-col items-center justify-center text-center">
           <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-4">
              <ClipboardList size={48} />
           </div>
           <h4 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีข้อมูลคำร้อง</h4>
           <p className="text-gray-500 max-w-sm">โปรดเข้าสู่ระบบเพื่อดูประวัติคำร้องหรือแจ้งปัญหาใหม่</p>
        </div>

        {/* Footer Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100/50 rounded-3xl p-6 flex items-start space-x-4 border border-gray-100">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500">
              <Clock size={24} />
            </div>
            <div>
              <h5 className="font-bold text-gray-800">อัปเดตล่าสุด</h5>
              <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบเพื่อสร้างและติดตามสถานะคำร้องของท่าน</p>
            </div>
          </div>

          <div className="bg-orange-50/50 border-2 border-dashed border-orange-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200 text-white mb-3">
              <HelpCircle size={24} />
            </div>
            <h5 className="font-bold text-gray-800">มีปัญหาในการค้นหา?</h5>
            <p className="text-gray-500 text-sm mt-1">ติดต่อศูนย์บริการ 044-223-XXX ในเวลาทำการ</p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Components ย่อยเพื่อความสะอาดของโค้ด
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-500 hover:bg-gray-100'
    }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

const InfoBox = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-gray-700 font-semibold">{value}</p>
  </div>
);

export default RequestsPage;