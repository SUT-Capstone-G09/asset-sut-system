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
import { useAuthContext } from "@/lib/context/auth-context";


const AssetSutUI = () => {
  const router = useRouter();
  const { user } = useAuthContext();

  const displayName = user ? `${user.first_name} ${user.last_name}` : "ผู้ใช้";

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
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
            <h2 className="text-2xl font-semibold text-gray-800">สวัสดี, คุณ {displayName}</h2>
            <p className="text-gray-500 mt-1">สร้างคำร้องและติดตามสถานะคำร้องของท่านได้ที่นี่</p>
          </div>

          <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium flex items-center hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
            onClick={() => router.push('/user/requests/add-request')}>
            <PlusCircle size={20} className="mr-2" />
            แจ้งเรื่องใหม่
          </button>
        </div>

        {/* Tracking Section */}
        <div className="mb-6 flex items-center">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></div>
          <h3 className="text-xl font-semibold text-gray-800">
            ติดตาม <span className="text-orange-500">สถานะคำร้อง</span>
          </h3>
        </div>

        {/* Request Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Result Found</span>
              <Link href="/user/requests/tracking">
                <h4 className="text-3xl font-bold text-gray-700 mt-1">REQ-2026-000123</h4>
              </Link>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              กำลังดำเนินการ (InProgress)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <InfoBox label="ประเภทรายการ" value="แจ้งซ่อมครุภัณฑ์ไฟฟ้า" />
            <InfoBox label="วันที่ยื่นเรื่อง" value="12 กรกฎาคม 2026" />
            <InfoBox label="อาคาร/สถานที่" value="อาคารวิชาการ 1" />
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center text-gray-500 text-sm font-medium">
              <FileText size={16} className="mr-2" />
              รายละเอียด
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-orange-500">
              <p className="text-gray-600 leading-relaxed italic">
                "เครื่องปรับอากาศในห้องทำงาน B1213 มีเสียงดังผิดปกติและไม่ทำความเย็น
                แจ้งขอตรวจสอบและดำเนินการแก้ไขเร่งด่วน เนื่องจากส่งผลกระทบต่อการทำงาน"
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase">JD</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-xs font-bold uppercase">SUT</span>
            </div>
            <Link href="/user/requests/tracking">
              <button className="text-orange-500 font-semibold flex items-center ">
                ดูรายละเอียด <ChevronRight size={20} className="ml-1" />
              </button>
            </Link>
          </div>
        </div>

        {/* Footer Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100/50 rounded-3xl p-6 flex items-start space-x-4 border border-gray-100">
            <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500">
              <Clock size={24} />
            </div>
            <div>
              <h5 className="font-bold text-gray-800">อัปเดตล่าสุด</h5>
              <p className="text-gray-500 text-sm mt-1">ทีมช่างได้รับเรื่องแล้ว และกำลังจัดสรรคิวงาน</p>
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

export default AssetSutUI;