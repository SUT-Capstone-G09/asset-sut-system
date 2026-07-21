"use client";
import React from 'react';
import {
  Wrench, ShoppingCart, Calendar as CalendarIcon, RotateCcw
} from 'lucide-react';
import { useAdminRequests } from '../../presentation/hooks/useAdminRequests';
import { AdminRequestFilters } from './AdminRequestFilters';
import { AdminRequestTable } from './AdminRequestTable';
import { AdminInquiryList } from './AdminInquiryList';

export default function AdminRequestTableView() {
  const {
    isMounted,
    currentTab,
    setCurrentTab,
    inquirySubTab,
    setInquirySubTab,
    searchTerm,
    setSearchTerm,
    requests,
    inquiries,
    isLoading,
    handleRequestClick,
    handleInquiryClick
  } = useAdminRequests();

  if (!isMounted) {
    return null;
  }

  // Helper to determine request type icons
  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('ซ่อม')) return <Wrench size={14} className="text-orange-500" />;
    if (t.includes('เบิก') || t.includes('จ่าย')) return <ShoppingCart size={14} className="text-blue-500" />;
    if (t.includes('จอง') || t.includes('พื้นที่')) return <CalendarIcon size={14} className="text-green-500" />;
    return <RotateCcw size={14} className="text-slate-500" />;
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REJECT': return 'bg-red-50 text-red-500 border border-red-100';
      case 'IN-PROGRESS': return 'bg-blue-50 text-blue-500 border border-blue-100';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border border-green-100';
      case 'CANCELLED': return 'bg-slate-100 text-slate-400 border border-slate-200';
      case 'PENDING': 
      default: return 'bg-orange-50 text-orange-500 border border-orange-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'REJECT': return 'ยกเลิก';
      case 'IN-PROGRESS': return 'กำลังดำเนินงาน';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'CANCELLED': return 'ยกเลิก';
      case 'PENDING':
      default: return 'รอดำเนินการ';
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {currentTab === 'requests' ? 'จัดการรายการคำร้อง' : 'กล่องข้อความติดต่อสอบถาม'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {currentTab === 'requests'
              ? 'ตรวจสอบและดำเนินการคำร้องขอใช้สินทรัพย์ รวมถึงการแจ้งซ่อมและบำรุงรักษา'
              : 'อ่านและดำเนินการตอบกลับข้อความติดต่อสอบถามข้อมูลทั่วไปจากหน้าเว็บไซต์'}
          </p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <AdminRequestFilters 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        inquirySubTab={inquirySubTab}
        setInquirySubTab={setInquirySubTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        inquiriesCount={inquiries.filter(item => item.status === 'unread').length}
      />

      {/* Content Lists */}
      {isLoading ? (
        <div className="bg-white rounded-md p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-bold text-sm animate-pulse">กำลังโหลดข้อมูลรายการ...</p>
        </div>
      ) : currentTab === 'requests' ? (
        <AdminRequestTable 
          requests={requests}
          handleRequestClick={handleRequestClick}
          getStatusStyle={getStatusStyle}
          getStatusLabel={getStatusLabel}
          getTypeIcon={getTypeIcon}
        />
      ) : (
        <AdminInquiryList 
          inquiries={inquiries}
          inquirySubTab={inquirySubTab}
          handleInquiryClick={handleInquiryClick}
        />
      )}
    </main>
  );
}
