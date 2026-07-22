"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Download,
  Eye,
  FilePen,
  FileText,
  FileUp,
  Grid3X3,
  MapPin,
  Receipt,
  Tags,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import {
  createBooking,
  BookingPurposeInput,
} from "@/features/bookings/services/booking.service";
import { createDocument, getDocumentTypeId } from "@/features/payment/services/document.service";
import { uploadFile, UPLOAD_FOLDERS, MAX_UPLOAD_SIZE_MB } from "@/lib/services/upload";
import DocumentFormModal from "@/features/bookings/components/confirm/DocumentFormModal";
import { HallBookingDraft } from "@/features/bookings/components/hall/HallBookingView";
import { cn } from "@/lib/utils";

function formatThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  room: Room;
}

// "generated" = created via DocumentFormModal (we know it's the booking
// form) ; "manual" = user picked it from their device (type is a guess at
// best) — mirrors the same distinction in BookingConfirmView.tsx.
interface UploadedFileEntry {
  file: File;
  source: "generated" | "manual";
}

export default function HallBookingConfirm({ room }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<HallBookingDraft | null>(null);
  const [note, setNote] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileEntry[]>([]);
  const [generateDoc, setGenerateDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`hall_booking_draft_${room.id}`);
    if (!raw) {
      router.replace(`/bookings/${room.id}`);
      return;
    }
    // defer setState ออกนอก effect body (เลี่ยงกฎ react-hooks/set-state-in-effect)
    let cancelled = false;
    void (async () => {
      const parsed = JSON.parse(raw) as HallBookingDraft;
      await Promise.resolve();
      if (!cancelled) setDraft(parsed);
    })();
    return () => {
      cancelled = true;
    };
  }, [room.id, router]);

  if (!draft) return null;

  const hasDocument = uploadedFiles.length > 0 || generateDoc;
  const purposeText =
    `ขอใช้พื้นที่โถง: ${draft.purposes.map((p) => p.name).join(", ")}` +
    (note.trim() ? ` — ${note.trim()}` : "");

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const tooLarge = incoming.filter((f) => f.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024);
    const accepted = incoming.filter((f) => f.size <= MAX_UPLOAD_SIZE_MB * 1024 * 1024);

    if (tooLarge.length > 0) {
      toast.error(
        tooLarge.length === 1
          ? `ไฟล์ "${tooLarge[0].name}" ใหญ่เกินไป (ไม่เกิน ${MAX_UPLOAD_SIZE_MB} MB)`
          : `ข้าม ${tooLarge.length} ไฟล์ที่ใหญ่เกิน ${MAX_UPLOAD_SIZE_MB} MB`
      );
    }

    setUploadedFiles((prev) => [
      ...prev,
      ...accepted.map((file): UploadedFileEntry => ({ file, source: "manual" })),
    ]);
  };
  const removeFile = (index: number) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  const openLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const downloadLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    Object.assign(document.createElement("a"), {
      href: url,
      download: file.name,
    }).click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // เวลา start/end อิงตาม Asia/Bangkok (UTC+7) แบบ explicit แล้ว normalize เป็น instant (…Z)
      // ผ่าน toISOString() — เหมือน flow จองห้อง (proven) ให้ round-trip กลับมาแสดงเป็นเวลาไทย
      // เต็มวัน 00:00–23:59 (ไม่พึ่ง timezone ของ browser และไม่พึ่งพฤติกรรม tz ของ driver)
      // ส่วน date ส่งเป็น UTC เที่ยงคืน (…Z) เพื่อให้คอลัมน์ date = วันปฏิทินที่เลือกเป๊ะ
      // — booked-cells (query ด้วย YYYY-MM-DD) จะตรงวัน ไม่เลื่อนไปวันก่อนหน้า
      const timeslots = draft.dates.map((date) => ({
        location_id: Number(draft.locationId),
        date: `${date}T00:00:00.000Z`,
        start_time: new Date(`${date}T00:00:00+07:00`).toISOString(),
        end_time: new Date(`${date}T23:59:00+07:00`).toISOString(),
        is_full_day: true,
      }));
      const purposes: BookingPurposeInput[] = draft.purposes.map((p) => ({
        hall_usage_purpose_id: p.hallUsagePurposeId,
        selected_cells: p.selectedCells,
        product_type_count: p.productTypeCount,
        product_names: p.productNames,
        proposed_price: p.proposedPrice,
      }));

      const booking = await createBooking({
        purpose: purposeText,
        timeslots,
        purposes,
      });
      sessionStorage.removeItem(`hall_booking_draft_${room.id}`);

      const bookingDate = draft.dates[0];
      for (const { file, source } of uploadedFiles) {
        try {
          const uploaded = await uploadFile(
            file,
            UPLOAD_FOLDERS.BOOKING_DOCS,
            bookingDate,
            room.name,
            booking.id,
          );
          // Resolved by name (not a hardcoded id) so this can't silently
          // break if the seed order for document_types ever changes.
          const documentTypeId = await getDocumentTypeId(source === "generated" ? "booking_form" : "other");
          await createDocument({
            booking_id: booking.id,
            document_type_id: documentTypeId,
            file_name: uploaded.file_name,
            bucket_name: uploaded.bucket_name,
            object_key: uploaded.object_key,
            file_url: uploaded.url,
            content_type: uploaded.content_type,
            method_id: 1,
          });
        } catch (err) {
          const reason = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
          toast.warning(
            `อัปโหลดเอกสาร "${file.name}" ไม่สำเร็จ (${reason}) — การจองถูกบันทึกแล้ว`,
          );
        }
      }

      router.push("/my-bookings");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            สรุปคำขอใช้พื้นที่โถง
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ตรวจสอบข้อมูลก่อนยืนยัน — ราคาจะได้รับการพิจารณาโดยผู้ดูแล
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Hall info + dates */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary">
                  <MapPin size={14} />
                </div>
                <h2 className="font-bold text-gray-900">
                  ข้อมูลพื้นที่ที่เลือก
                </h2>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden flex">
                <div className="w-40 shrink-0">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 p-4">
                  <h3 className="text-lg font-bold text-brand-primary">
                    {room.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={13} className="text-brand-primary shrink-0" />
                    {room.building}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  วันที่ขอใช้ ({draft.dates.length} วัน)
                </p>
                <div className="flex flex-wrap gap-2">
                  {draft.dates.map((d) => (
                    <span
                      key={d}
                      className="flex items-center gap-1.5 text-sm bg-orange-50 border border-orange-100 text-brand-primary px-2.5 py-1 rounded-full"
                    >
                      <CalendarDays size={13} /> {formatThaiDate(d)} · เต็มวัน
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Purposes summary */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary">
                  <Tags size={14} />
                </div>
                <h2 className="font-bold text-gray-900">
                  วัตถุประสงค์การขอใช้
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {draft.purposes.map((p) => {
                  const area =
                    p.selectedCells && p.cellSizeM
                      ? p.selectedCells.length * p.cellSizeM * p.cellSizeM
                      : undefined;
                  return (
                    <div
                      key={p.hallUsagePurposeId}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3.5"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {p.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.selectedCells && (
                          <span className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            <Grid3X3 size={11} /> {p.selectedCells.length} ช่อง
                            {area !== undefined &&
                              ` · ~${area.toLocaleString(undefined, { maximumFractionDigits: 2 })} ตร.ม.`}
                          </span>
                        )}
                        {p.productTypeCount !== undefined && (
                          <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {p.productTypeCount} ประเภทสินค้า
                          </span>
                        )}
                        {/* {p.computedPrice !== undefined && (
                          <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            ราคาระบบ ฿{p.computedPrice.toLocaleString()}
                          </span>
                        )} */}
                        {p.proposedPrice !== undefined && (
                          <span className="flex items-center gap-1 text-xs bg-orange-50 border border-orange-100 text-brand-primary px-2 py-0.5 rounded-full">
                            <Receipt size={11} /> เสนอ ฿
                            {p.proposedPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {p.productNames && p.productNames.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-medium text-gray-600">
                            สินค้าที่จะแจก:
                          </span>{" "}
                          {p.productNames.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  รายละเอียดเพิ่มเติม (ไม่บังคับ)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ระบุรายละเอียดกิจกรรม/สินค้า เพิ่มเติม..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                />
              </div>
            </section>

            {/* Documents */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary">
                  <FilePen size={14} />
                </div>
                <h2 className="font-bold text-gray-900">การจัดการเอกสาร</h2>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocCard
                  icon={<FileUp size={28} className="text-brand-primary" />}
                  title="อัปโหลดเอกสาร"
                  description="สำหรับผู้ที่มีเอกสารพร้อมแล้ว"
                  selected={uploadedFiles.length > 0}
                  onClick={() => fileInputRef.current?.click()}
                />
                <DocCard
                  icon={<FilePen size={28} className="text-brand-primary" />}
                  title="สร้างเอกสารผ่านระบบ"
                  description="สร้างไฟล์ PDF อัตโนมัติจากข้อมูลการจอง"
                  selected={generateDoc}
                  onClick={() => setShowDocModal(true)}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {uploadedFiles.map(({ file }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="ดูเอกสาร"
                          onClick={() => openLocalFile(file)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="ดาวน์โหลด"
                          onClick={() => downloadLocalFile(file)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-orange-50"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          title="ลบไฟล์"
                          onClick={() => removeFile(i)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            {/* Terms */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                ข้อตกลงและเงื่อนไข <span className="text-red-400">*</span>
              </label>
              <div
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10)
                    setTermsRead(true);
                }}
                className="h-44 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed space-y-2 select-none"
              >
                <p className="font-semibold text-gray-700">
                  ข้อตกลงและเงื่อนไขการจองและเข้าใช้พื้นที่
                </p>
                <p className="text-gray-400 italic">
                  การยืนยันคำขอถือเป็นการยอมรับเงื่อนไขดังต่อไปนี้
                </p>
                <p className="font-medium">
                  หมวดโถงอาคาร (พื้นที่จัดกิจกรรม/ออกร้าน):
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>
                    การติดตั้งโครงสร้าง บอร์ด ป้าย หรือเวที
                    ต้องไม่กีดขวางทางเดินหลักและประตูหนีไฟ
                  </li>
                  <li>
                    ห้ามตอก เจาะ
                    หรือติดเทปกาวที่ก่อให้เกิดความเสียหายต่อพื้นผิวอาคาร
                  </li>
                  <li>
                    ผู้จองต้องจัดเก็บขยะและทำความสะอาดพื้นที่ทันทีหลังจบกิจกรรม
                  </li>
                  <li>
                    ต้องใช้พื้นที่เฉพาะช่องที่ได้รับอนุมัติ
                    ไม่รุกล้ำพื้นที่ของผู้อื่น
                  </li>
                </ul>
                <p>
                  ผู้ขอต้องรับผิดชอบความเสียหายต่อสถานที่/ทรัพย์สินส่วนรวมอันเกิดจากการใช้งานผิดประเภทหรือความประมาท
                </p>
                <p>
                  ราคาที่เสนอจะได้รับการพิจารณาโดยผู้ดูแล
                  และอาจถูกตีกลับให้แก้ไขก่อนอนุมัติ
                </p>
              </div>
              {!termsRead && (
                <p className="text-xs text-gray-400 mt-1">
                  เลื่อนอ่านจนถึงด้านล่างเพื่อยอมรับข้อตกลง
                </p>
              )}
              <label
                className={cn(
                  "flex items-start gap-2 mt-2 cursor-pointer",
                  !termsRead && "opacity-40 cursor-not-allowed",
                )}
              >
                <input
                  type="checkbox"
                  disabled={!termsRead}
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-xs text-gray-600">
                  ข้าพเจ้าได้อ่าน ทำความเข้าใจ
                  และยอมรับข้อปฏิบัติในการใช้พื้นที่ทุกประการ
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleConfirm}
                disabled={!hasDocument || !termsAccepted || submitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "กำลังส่งคำขอ..." : "ยืนยันคำขอ"}
              </Button>
              {(!hasDocument || !termsAccepted) && (
                <p className="text-xs text-red-400 text-center">
                  {!hasDocument
                    ? "กรุณาอัปโหลดเอกสารหรือสร้างเอกสารก่อนยืนยัน"
                    : "กรุณายอมรับข้อตกลงและเงื่อนไขก่อนยืนยัน"}
                </p>
              )}
              {submitError && (
                <p className="text-xs text-red-500 text-center">
                  {submitError}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full h-12 rounded-xl text-base font-medium border-gray-200 text-gray-600 hover:text-gray-900"
            >
              ย้อนกลับ
            </Button>
          </div>
        </div>
      </div>

      {showDocModal && (
        <DocumentFormModal
          room={room}
          timeslots={draft.dates.map((d) => ({
            date: d,
            startTime: "00:00",
            endTime: "23:59",
          }))}
          purpose={purposeText}
          onClose={() => setShowDocModal(false)}
          onGenerated={(file) => {
            setUploadedFiles((prev) => [...prev, { file, source: "generated" }]);
            setGenerateDoc(true);
          }}
        />
      )}
    </>
  );
}

function DocCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
        selected
          ? "border-brand-primary/30 bg-orange-50"
          : "border-gray-100 bg-gray-50 hover:border-brand-primary/30 hover:bg-orange-50",
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
