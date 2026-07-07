import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { RequestRepository } from '../../data/repositories/request.repository';
import { GetRequestDetailUseCase } from '../../domain/usecases/get-request-detail.usecase';
import { ChatMessage } from '../../components/RequestDetailChat';
import { StatusStepData } from '../../components/RequestDetailStatus';

const repository = new RequestRepository();
const getRequestDetailUseCase = new GetRequestDetailUseCase(repository);

const formatThaiDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear() + 543;
    const dateFormatted = date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short"
    });
    const timeFormatted = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${dateFormatted} ${year % 100} • ${timeFormatted} น.`;
  } catch (e) {
    return dateStr;
  }
};

export const useRequestDetail = () => {
  const searchParams = useSearchParams();
  const refcode = searchParams.get('id') || "";

  const [isMounted, setIsMounted] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [histories, setHistories] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !refcode) return;

    const loadRequestDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getRequestDetailUseCase.execute(refcode);
        if (response) {
          setRequest(response.request);
          setHistories(response.histories || []);
          
          if (response.messages && response.messages.length > 0) {
            const mappedMessages: ChatMessage[] = response.messages.map((msg: any) => ({
              id: `msg-${msg.id}`,
              senderType: msg.is_staff ? 'staff' : 'user',
              senderName: msg.is_staff ? (msg.user?.profile?.first_name || "เจ้าหน้าที่") : undefined,
              content: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
              read: true
            }));
            setChatMessages(mappedMessages);
          } else {
            setChatMessages([]);
          }
        }
      } catch (err: any) {
        console.error("Error loading request details:", err);
        setError("ไม่พบข้อมูลคำร้องดังกล่าว หรือท่านไม่มีสิทธิ์เข้าถึง");
      } finally {
        setIsLoading(false);
      }
    };

    loadRequestDetail();
  }, [isMounted, refcode]);

  // Construct status steps dynamically
  const statusSteps = useMemo<StatusStepData[]>(() => {
    if (!request) return [];

    const dbStatus = request.status?.status?.toLowerCase() || "";
    const isPending = dbStatus === "pending";
    const isInProgress = dbStatus === "in_progress" || dbStatus === "in progress" || dbStatus === "inprogress";
    const isCompleted = dbStatus === "completed" || dbStatus === "resolved";
    const isCancelled = dbStatus === "cancelled";
    const isRejected = dbStatus === "reject";
    
    const steps: StatusStepData[] = [
      {
        title: "รับเรื่อง",
        desc: "เจ้าหน้าที่รับเรื่องและตรวจสอบข้อมูลเบื้องต้นเรียบร้อยแล้ว",
        time: formatThaiDate(request.created_at),
        icon: React.createElement(CheckCircle2, { size: 24 }),
        active: true,
        done: true
      },
      {
        title: "กำลังดำเนินการ",
        desc: "ประสานงานช่างเทคนิคเพื่อเข้าตรวจสอบหน้างาน",
        time: isInProgress || isCompleted ? formatThaiDate(request.updated_at) : "",
        icon: React.createElement(MessageCircle, { size: 24 }),
        active: isInProgress || isCompleted,
        done: isCompleted,
        disabled: isPending || isCancelled || isRejected,
        color: isInProgress ? "bg-orange-500" : undefined
      },
      {
        title: isRejected ? "ปฏิเสธ" : isCancelled ? "ยกเลิก" : "เสร็จสิ้น",
        desc: isRejected ? "คำร้องไม่ถูกต้อง / ไม่ผ่านการอนุมัติ" : isCancelled ? "คำร้องถูกยกเลิกโดยผู้แจ้งหรือแอดมิน" : "การดำเนินงานและซ่อมบำรุงเสร็จสิ้นเรียบร้อยแล้ว",
        time: (isCompleted || isCancelled || isRejected) ? formatThaiDate(request.updated_at) : "",
        icon: React.createElement(CheckCircle2, { size: 24 }),
        active: isCompleted || isCancelled || isRejected,
        done: isCompleted || isCancelled || isRejected,
        disabled: !(isCompleted || isCancelled || isRejected),
        color: isCompleted ? "bg-green-500" : isCancelled ? "bg-slate-400" : isRejected ? "bg-red-500" : undefined
      }
    ];

    return steps;
  }, [request]);

  const requestInfo = useMemo(() => {
    if (!request) return null;

    const dbStatus = request.status?.status?.toLowerCase() || "";
    const isInProgress = dbStatus === "in_progress" || dbStatus === "in progress" || dbStatus === "inprogress";
    const isCompleted = dbStatus === "completed" || dbStatus === "resolved";
    const isCancelled = dbStatus === "cancelled";
    const isRejected = dbStatus === "reject";

    let statusLabel = "รอดำเนินการ";
    if (isInProgress) statusLabel = "กำลังดำเนินการ";
    else if (isCompleted) statusLabel = "เสร็จสิ้น";
    else if (isCancelled) statusLabel = "ยกเลิก";
    else if (isRejected) statusLabel = "ปฏิเสธ";

    return {
      refNumber: request.refcode,
      category: request.request_type?.name || "ซ่อมบำรุงทั่วไป",
      createdAt: formatThaiDate(request.created_at),
      status: statusLabel,
      title: request.title,
      description: request.description,
      location: request.location,
      eventDate: request.incident_date ? request.incident_date : "ไม่ได้ระบุ",
      attachments: request.evidence_urls || []
    };
  }, [request]);

  const handleSendMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-sent-${Date.now()}`,
      senderType: 'user',
      content,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      read: false
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  return {
    isMounted,
    refcode,
    requestInfo,
    histories,
    chatMessages,
    statusSteps,
    isLoading,
    error,
    handleSendMessage
  };
};
