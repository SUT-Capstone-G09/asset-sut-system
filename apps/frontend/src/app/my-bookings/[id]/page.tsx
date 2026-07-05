"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileText,
  Package,
  Loader2,
  UploadCloud,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PageContainer from "@/components/layout/PageContainer";
import {
  getBookingById,
  BookingResponseDTO,
} from "@/features/bookings/services/booking.service";
import {
  getDocumentsByBookingId,
  createDocument,
  DocumentDTO,
} from "@/features/payment/services/document.service";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

// ── Step mapping ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "created",
    label: "เริ่มต้นการจอง",
    desc: "กรอกข้อมูลเบื้องต้นเรียบร้อยแล้ว",
  },
  {
    key: "pending",
    label: "รอดำเนินการอนุมัติ",
    desc: "คำขอจะได้รับการตรวจสอบโดยผู้ดูแล",
  },
  {
    key: "approved",
    label: "รอชำระเงิน",
    desc: "ชำระผ่านช่องทางต่างๆ ของมหาวิทยาลัย",
  },
  {
    key: "completed",
    label: "เสร็จสิ้น",
    desc: "การจองของคุณเสร็จสมบูรณ์",
  },
];

// step 0 = created (always done), 1 = pending, 2 = approved, 3 = completed
function getStepIndex(status: string): number {
  if (status === "pending") return 1;
  if (status === "approved") return 2;
  if (status === "completed") return 3;
  return 1;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:   { label: "รออนุมัติ",   className: "bg-orange-100 text-orange-600 border-orange-200" },
  approved:  { label: "อนุมัติแล้ว", className: "bg-blue-100 text-blue-600 border-blue-200" },
  completed: { label: "เสร็จสิ้น",   className: "bg-green-100 text-green-600 border-green-200" },
  rejected:  { label: "ปฏิเสธ",      className: "bg-red-100 text-red-500 border-red-200" },
  cancelled: { label: "ยกเลิก",      className: "bg-gray-100 text-gray-500 border-gray-200" },
};

// ── Stepper (horizontal 4 steps) ─────────────────────────────────────────────
function BookingStepper({ currentStatus }: { currentStatus: string }) {
  const stepIdx = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "rejected" || currentStatus === "cancelled";

  const progressWidth = isCancelled
    ? "0%"
    : stepIdx === 0 ? "0%"
    : stepIdx === 1 ? "33.33%"
    : stepIdx === 2 ? "66.66%"
    : "100%";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-8 py-6 shadow-sm">
      <div className="flex items-start justify-between relative">
        {/* background line */}
        <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-gray-100 z-0" />
        {/* progress line */}
        <div
          className="absolute top-5 left-[calc(12.5%)] h-0.5 bg-brand-primary z-0 transition-all duration-500"
          style={{ width: progressWidth }}
        />

        {STEPS.map((step, idx) => {
          const done = !isCancelled && idx < stepIdx;
          const active = !isCancelled && idx === stepIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all",
                  done
                    ? "bg-brand-primary border-brand-primary text-white"
                    : active
                    ? "bg-white border-brand-primary text-brand-primary"
                    : "bg-white border-gray-200 text-gray-300"
                )}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <span>{idx + 1}</span>}
              </div>
              <div className="text-center px-1">
                <p
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    done || active ? "text-brand-primary" : "text-gray-400"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail Tab ────────────────────────────────────────────────────────────────
type Tab = "detail" | "docs";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<BookingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("detail");
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then(setBooking)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px] gap-2 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">กำลังโหลด...</span>
        </div>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <div className="text-center py-20 text-gray-400 text-sm">
          {error ?? "ไม่พบข้อมูลการจอง"}
        </div>
      </PageContainer>
    );
  }

  const firstSlot = booking.timeslots?.[0];
  const badgeStyle = STATUS_BADGE[booking.status] ?? STATUS_BADGE.pending;

  const bookingDate = firstSlot
    ? new Date(firstSlot.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "–";

  const startTime = firstSlot
    ? new Date(firstSlot.start_time).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "–";

  const endTime = firstSlot
    ? new Date(firstSlot.end_time).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "–";

  const durationHours = firstSlot
    ? Math.max(
        1,
        Math.round(
          (new Date(firstSlot.end_time).getTime() -
            new Date(firstSlot.start_time).getTime()) /
            3600000
        )
      )
    : 1;

  const allAddons = (booking.timeslots?.flatMap((s) => s.addons ?? []) ?? []).filter(Boolean);

  const lightboxEl = typeof window !== "undefined" ? document.body : null;

  return (
    <>
    <PageContainer>
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/my-bookings"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={15} />
            กลับไปการจองของฉัน
          </Link>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <BookingStepper currentStatus={booking.status} />
        </div>

        {/* Header Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Room banner */}
          <div
            className="relative w-full h-44 bg-gray-100 cursor-zoom-in group"
            onClick={() => setLightbox(true)}
          >
            <img
              src={firstSlot?.location_image ?? "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"}
              alt={firstSlot?.location_name ?? "room"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {/* Zoom hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                <ZoomIn size={20} className="text-white" />
              </div>
            </div>
            {/* Badge overlay */}
            <div className="absolute top-4 left-4">
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm", badgeStyle.className)}>
                {badgeStyle.label}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-400 font-mono">
                  Booking Ref: #BK-{booking.id}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {firstSlot?.location_name ?? "ห้อง"}
                </h1>
                {booking.purpose && (
                  <p className="text-sm text-gray-500 mt-1">{booking.purpose}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {booking.status === "approved" && (
                  <Link href={`/payment/${booking.id}`}>
                    <Button className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">
                      <CreditCard size={15} />
                      ชำระเงิน
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — booking info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Main Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4">ข้อมูลการจองหลัก</h3>
              <div className="flex flex-col gap-3">
                <InfoRow
                  icon={<Calendar size={16} className="text-brand-primary" />}
                  label="วันที่"
                  value={bookingDate}
                />
                <InfoRow
                  icon={<Clock size={16} className="text-brand-primary" />}
                  label="เวลา"
                  value={`${startTime} – ${endTime} (${durationHours} ชม.)`}
                />
                <InfoRow
                  icon={<MapPin size={16} className="text-brand-primary" />}
                  label="สถานที่"
                  value={firstSlot?.location_name ?? "–"}
                />
              </div>
            </div>

            {/* Addons / Equipment */}
            {allAddons.length > 0 && booking.status === "approved" && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Package size={15} className="text-brand-primary" />
                  รายการ Add-ons
                </h3>
                <div className="flex flex-col gap-2">
                  {allAddons.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-brand-primary shrink-0" />
                        <span className="text-gray-700">
                          {a.addon_name}
                          {a.quantity > 1 && (
                            <span className="text-gray-400 ml-1">×{a.quantity}</span>
                          )}
                        </span>
                      </div>
                      <span className="text-gray-500 font-medium">
                        ฿{a.total_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price summary */}
            {booking.status === "approved" || booking.status === "completed" ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">สรุปราคา</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>ค่าห้อง</span>
                    <span>฿{(booking.base_price ?? 0).toLocaleString()}</span>
                  </div>
                  {(booking.addon_price ?? 0) > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>ค่า Add-ons</span>
                      <span>฿{(booking.addon_price ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                  {booking.total_price === 0 && (booking.base_price > 0 || (booking.addon_price ?? 0) > 0) && (
                    <div className="flex justify-between text-emerald-500">
                      <span>ส่วนลด / ยกเว้นค่าบริการ</span>
                      <span>-฿{(booking.base_price + (booking.addon_price ?? 0)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between font-bold text-gray-900">
                    <span>รวมทั้งหมด</span>
                    <span className="text-brand-primary">
                      ฿{(booking.total_price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : booking.status === "pending" || booking.status === "cancelled" || booking.status === "rejected" ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-gray-400 gap-2 h-32">
                <p className="text-sm font-semibold">กำลังรอผู้ดูแลระบบสรุปค่าใช้จ่าย</p>
                <p className="text-xs">ค่าใช้จ่ายจะแสดงเมื่อผู้ดูแลระบบตรวจสอบเสร็จสิ้น</p>
              </div>
            ) : null}
          </div>

          {/* Right — tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Tab header */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setTab("detail")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors",
                    tab === "detail"
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <FileText size={14} />
                  รายละเอียดการจอง
                </button>
                <button
                  onClick={() => setTab("docs")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors",
                    tab === "docs"
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <FileText size={14} />
                  เอกสารที่เกี่ยวข้อง
                </button>
              </div>

              {/* Tab body */}
              <div className="p-5">
                {tab === "detail" ? (
                  <BookingDetailTab booking={booking} />
                ) : (
                  <BookingDocsTab bookingId={booking.id} bookingDate={firstSlot?.date?.slice(0, 10)} locationName={firstSlot?.location_name} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </PageContainer>

      {lightbox && lightboxEl && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={22} />
          </button>
          <img
            src={firstSlot?.location_image ?? "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"}
            alt={firstSlot?.location_name ?? "room"}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {firstSlot?.location_name}
          </p>
        </div>,
        lightboxEl
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function BookingDetailTab({ booking }: { booking: BookingResponseDTO }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Status logs */}
      {booking.status_logs && booking.status_logs.length > 0 ? (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            ประวัติสถานะ
          </h4>
          <div className="flex flex-col gap-2">
            {booking.status_logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 text-sm border-l-2 border-gray-100 pl-3 py-1"
              >
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">
                    {log.from_status} → {log.to_status}
                  </p>
                  {log.note && (
                    <p className="text-gray-400 text-xs mt-0.5">{log.note}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-0.5">
                    โดย {log.changed_by_name} ·{" "}
                    {new Date(log.changed_at).toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          ยังไม่มีประวัติสถานะ
        </p>
      )}

      {/* Timeslots */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          รายการ Timeslot
        </h4>
        <div className="flex flex-col gap-2">
          {booking.timeslots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {slot.location_name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(slot.date).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" · "}
                  {new Date(slot.start_time).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  {" – "}
                  {new Date(slot.end_time).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                ฿{slot.price_snapshot.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingDocsTab({ bookingId, bookingDate, locationName }: { bookingId: number; bookingDate?: string; locationName?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocs = () => {
    setLoading(true);
    setFetchError(null);
    getDocumentsByBookingId(bookingId)
      .then((data) => setDocs(data ?? []))
      .catch((err: Error) => {
        setDocs([]);
        setFetchError(err?.message ?? "โหลดเอกสารไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [bookingId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadFile(file, UPLOAD_FOLDERS.BOOKING_DOCS, bookingDate, locationName, bookingId);
      await createDocument({
        booking_id: bookingId,
        document_type_id: file.type === "application/pdf" ? 2 : 4,
        file_name: uploaded.file_name,
        bucket_name: uploaded.bucket_name,
        object_key: uploaded.object_key,
        file_url: uploaded.url,
        content_type: uploaded.content_type,
        method_id: 1,
      });
      fetchDocs();
    } catch {
      setUploadError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openDoc = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadDoc = async (doc: DocumentDTO) => {
    const res = await fetch(doc.file_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: doc.file_name }).click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-brand-primary/40 hover:bg-orange-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? <><Loader2 size={15} className="animate-spin" /> กำลังอัปโหลด...</>
            : <><UploadCloud size={15} /> อัปโหลดเอกสารเพิ่มเติม</>}
        </button>
        {uploadError && (
          <p className="text-xs text-red-400 mt-1.5 text-center">{uploadError}</p>
        )}
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">กำลังโหลดเอกสาร...</span>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <p className="text-sm font-medium text-red-500">โหลดเอกสารไม่สำเร็จ</p>
          <p className="text-xs text-red-400 text-center max-w-xs">{fetchError}</p>
          <button onClick={fetchDocs} className="text-xs text-brand-primary underline mt-1">ลองใหม่</button>
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
          <FileText size={32} className="text-gray-200" />
          <p className="text-sm font-medium">ยังไม่มีเอกสาร</p>
          <p className="text-xs text-gray-300">อัปโหลดเอกสารด้านบนเพื่อเพิ่มเอกสารการจอง</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {doc.file_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {doc.document_type} ·{" "}
                  {new Date(doc.created_at).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  title="ดูเอกสาร"
                  onClick={() => openDoc(doc.file_url)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50 transition-colors"
                >
                  <Eye size={15} />
                </button>
                <button
                  title="ดาวน์โหลด"
                  onClick={() => downloadDoc(doc)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50 transition-colors"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
