"use client";

import React, { useState } from 'react';
import { useAuthContext } from "@/lib/context/auth-context";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { useDashboard } from '../hooks/useDashboard';
import { CreateRequestDrawer } from './CreateRequestForm';
import { UserWelcomeBanner } from './UserWelcomeBanner';
import { UserRequestFilters } from './UserRequestFilters';
import { UserRequestCard } from './UserRequestCard';

export const UserRequests = () => {
  const { user } = useAuthContext();
  const {
    isMounted,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    visibleItems,
    counts,
    loadMore,
    showLess,
    hasMore,
    canShowLess
  } = useDashboard();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!isMounted) {
    return null;
  }

  const displayName = user ? `${user.first_name} ${user.last_name}` : "ผู้ใช้งาน ทั่วไป";

  return (
    <div className="p-8 space-y-8 font-sans">

      {/* Breadcrumb */}
      <div className="mb-4">
        <AssetBreadcrumb
          items={[
            { label: "หน้าหลัก", href: "/" },
            { label: "คำร้องขอ" }
          ]}
        />
      </div>

      {/* Welcome Banner Header */}
      <UserWelcomeBanner
        displayName={displayName}
        onNewRequestClick={() => setIsCreateOpen(true)}
      />

      {/* 📍 แถบแท็บหลักสลับการทำงาน (Tabs Bar) & ค้นหาและตัวกรอง */}
      <UserRequestFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        counts={counts}
      />

      {/* 📊 รายการแสดงผล Grid คอลัมน์รายการทั้งหมด */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <UserRequestCard key={item.id} item={item} />
          ))
        ) : (
          <div className="md:col-span-2 bg-white rounded-md p-16 text-center border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
            ไม่พบประวัติข้อมูลคำร้องหรือข้อความสอบถามในหมวดหมู่นี้
          </div>
        )}
      </div>

      {/* See More & Show Less Buttons */}
      {(hasMore || canShowLess) && (
        <div className="flex justify-center items-center gap-3 pt-2">
          {hasMore && (
            <button
              onClick={loadMore}
              className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-500 font-bold rounded-[7px] hover:bg-slate-50 transition-all flex items-center gap-2 text-xs shadow-sm active:scale-[0.98] cursor-pointer"
            >
              ดูเพิ่มเติม (See More)
            </button>
          )}
          {canShowLess && (
            <button
              onClick={showLess}
              className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-500 font-bold rounded-[7px] hover:bg-slate-50 transition-all flex items-center gap-2 text-xs shadow-sm active:scale-[0.98] cursor-pointer"
            >
              แสดงน้อยลง (Show Less)
            </button>
          )}
        </div>
      )}

      <CreateRequestDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
