"use client";

import React, { useState } from 'react';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import RequestDetailHeader from '@/features/requests/components/RequestDetailHeader';
import RequestDetailDescription from '@/features/requests/components/RequestDetailDescription';
import RequestDetailStatus from '@/features/requests/components/RequestDetailStatus';
import RequestDetailChat from '@/features/requests/components/RequestDetailChat';
import { useRequestDetail } from '@/features/requests/presentation/hooks/useRequestDetail';

const RequestDetailPage = () => {
  const [activeTab, setActiveTab] = useState('details');
  
  const {
    isMounted,
    refcode,
    requestInfo,
    histories,
    chatMessages,
    statusSteps,
    isLoading,
    error,
    handleSendMessage
  } = useRequestDetail();

  const handleAttachFile = () => {
    alert('ระบบแนบไฟล์ยังไม่เปิดให้บริการขณะนี้');
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-sans">
        <div className="text-slate-500 font-bold text-lg animate-pulse">กำลังโหลดรายละเอียดคำร้อง...</div>
      </div>
    );
  }

  if (error || !requestInfo) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-sans space-y-4">
        <div className="text-red-500 font-extrabold text-xl">{error || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}</div>
        <button 
          onClick={() => window.history.back()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans text-slate-800">
      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <AssetBreadcrumb
              items={[
                { label: "หน้าหลัก", href: "/" },
                { label: "คำร้องขอ", href: "/user/requests" },
                { label: "รายละเอียดคำร้อง" }
              ]}
            />
          </div>
          <div className="p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
            {/* Left Column: Request Info & Status */}
            <div className="col-span-8 space-y-6">
              <RequestDetailHeader
                refNumber={requestInfo.refNumber}
                category={requestInfo.category}
                createdAt={requestInfo.createdAt}
                status={requestInfo.status}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {activeTab === 'details' && (
                <>
                  <RequestDetailDescription
                    title={requestInfo.title}
                    description={requestInfo.description}
                    location={requestInfo.location}
                    eventDate={requestInfo.eventDate}
                    attachments={requestInfo.attachments}
                  />
                  <RequestDetailStatus steps={statusSteps} />
                </>
              )}

              {activeTab === 'history' && (
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                  <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full mr-4" /> ประวัติการดำเนินงาน
                  </h4>
                  <div className="space-y-6 mt-4 pl-4">
                    {histories.length > 0 ? (
                      histories.map((h: any, idx: number) => {
                        let iconChar = "🔄";
                        let iconBg = "bg-blue-500";
                        const stepStatus = h.status?.status?.toLowerCase() || "";
                        
                        if (stepStatus === "pending") {
                          iconChar = "✓";
                          iconBg = "bg-green-500";
                        } else if (stepStatus === "completed" || stepStatus === "resolved") {
                          iconChar = "🎉";
                          iconBg = "bg-emerald-500";
                        }

                        // Format Thai date for history
                        let historyDate = "";
                        try {
                          const dateObj = new Date(h.created_at);
                          const year = dateObj.getFullYear() + 543;
                          const dateStr = dateObj.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short"
                          });
                          const timeStr = dateObj.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                          historyDate = `${dateStr} ${year % 100} • ${timeStr} น.`;
                        } catch (e) {
                          historyDate = h.created_at;
                        }

                        return (
                          <div key={h.id || idx} className="flex items-start space-x-4 relative">
                            {idx < histories.length - 1 && (
                              <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-gray-200"></div>
                            )}
                            <div className={`w-8 h-8 rounded-full ${iconBg} text-white flex items-center justify-center z-10 text-xs`}>
                              {iconChar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">เปลี่ยนสถานะเป็น "{h.status?.status === "in_progress" ? "กำลังดำเนินการ" : h.status?.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}"</p>
                              <p className="text-xs text-gray-400 mt-0.5">{historyDate} — โดย {h.admin?.profile?.first_name || h.assigned_staff?.profile?.first_name || "ระบบ"}</p>
                              {h.detail && (
                                <p className="text-xs text-slate-500 bg-gray-50 p-2 rounded-lg mt-2 border border-gray-100">
                                  "{h.detail}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-400 text-sm">ยังไม่มีประวัติการดำเนินงานสำหรับคำร้องนี้</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Chat System */}
            <div className="col-span-4 h-[calc(100vh-140px)] sticky">
              <RequestDetailChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onAttachFile={handleAttachFile}
              />
            </div>
          </div>
        </main>

        <footer className="p-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          © 2024 SURANAREE UNIVERSITY OF TECHNOLOGY • ASSET MANAGEMENT DIVISION
        </footer>
      </div>
    </div>
  );
};

export default RequestDetailPage;