"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentPageContrainer } from "@/features/payment/component/layout/contrainer";
import { PaymentSummaryCard } from "@/features/payment/component/PaymentSummaryCard";
import { QRCodeCard } from "@/features/payment/component/QRCodeCard";
import { PaymentPageSkeleton } from "@/features/payment/component/loading/PaymentPageSkeleton";
import {
  getInvoiceByBookingId,
  generateQR,
  verifySlip,
  InvoiceDTO,
  GenerateQRResponse,
} from "@/features/payment/services/payment.service";
import {
  getBookingById,
  BookingResponseDTO,
} from "@/features/bookings/services/booking.service";
import { createDocument } from "@/features/payment/services/document.service";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

const REASON_TH: Record<string, string> = {
  amount: "ยอดเงินไม่ตรง",
  ref1: "เลขอ้างอิงไม่ตรง",
  paid_before_qr: "เวลาชำระก่อนการสร้าง QR",
};

function describeReasons(reasons?: string[]): string {
  if (!reasons || reasons.length === 0) return "ข้อมูลสลิปไม่ตรงกับรายการ";
  return reasons.map((r) => REASON_TH[r] ?? r).join(", ");
}

function UploadZoneControlled({
  onFileChange,
}: {
  onFileChange: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file?.name ?? null);
    onFileChange(file);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50/50 border-2 border-dashed transition-colors duration-200 hover:bg-orange-50 mx-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 mb-4">
        <Upload className="w-6 h-6" />
      </div>
      <h4 className="text-md font-bold text-slate-800 mb-1">
        {fileName ?? "อัปโหลดหลักฐานการชำระเงิน"}
      </h4>
      {!fileName && (
        <p className="text-md text-slate-400 text-center mb-2">
          รองรับไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5MB
        </p>
      )}
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 px-6 py-2 rounded-xl font-semibold shadow-md ${
          fileName
            ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
            : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
        } text-white`}
      >
        {fileName ? "เปลี่ยนไฟล์" : "เลือกไฟล์"}
      </Button>
    </div>
  );
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Number(id);

  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [booking, setBooking] = useState<BookingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState<GenerateQRResponse | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    Promise.all([getInvoiceByBookingId(bookingId), getBookingById(bookingId)])
      .then(([inv, bk]) => {
        setInvoice(inv);
        setBooking(bk);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Generate the payment QR (amount + ref1 come from the booking on the backend).
  useEffect(() => {
    if (!bookingId) return;
    setQrError(null);
    generateQR(bookingId, "biller")
      .then(setQrData)
      .catch((err: Error) => setQrError(err.message));
  }, [bookingId]);

  const handleSubmit = useCallback(async () => {
    if (!invoice || !selectedFile) {
      setSubmitError("กรุณาอัปโหลดสลิปการชำระเงิน");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const firstSlot = booking?.timeslots?.[0];
      const bDateStr = firstSlot?.date ? firstSlot.date.slice(0, 10) : undefined;
      const locName = firstSlot?.location_name;

      // 1. Upload slip to storage
      const uploadResult = await uploadFile(selectedFile, UPLOAD_FOLDERS.PAYMENT_SLIP, bDateStr, locName, bookingId);

      // 2. Create document record (payment_slip)
      const doc = await createDocument({
        booking_id: bookingId,
        document_type_id: 1, // payment_slip
        file_name: uploadResult.file_name,
        bucket_name: uploadResult.bucket_name,
        object_key: uploadResult.object_key,
        file_url: uploadResult.url,
        content_type: uploadResult.content_type,
        method_id: 1, // upload
      });

      // 3. Verify the slip via EasySlip — this creates the payment transaction
      //    and runs the auto-match verdict (amount / ref1 / receiver).
      const result = await verifySlip(bookingId, doc.id);

      if (result.status === "mismatch") {
        setSubmitError(
          `ตรวจสลิปไม่ผ่าน: ${describeReasons(result.reasons)} — กรุณาตรวจสอบแล้วอัปโหลดใหม่`
        );
        setSubmitting(false);
        return;
      }

      // auto_verified — payment recorded, awaiting staff confirmation
      router.push("/payment/success");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setSubmitting(false);
    }
  }, [invoice, booking, router, selectedFile, bookingId]);

  if (loading) return <PaymentPageSkeleton />;

  if (error || !invoice || !booking) {
    return (
      <PaymentPageContrainer>
        <div className="text-center py-20 text-slate-500">
          {error ?? "ไม่พบข้อมูลการจอง"}
        </div>
      </PaymentPageContrainer>
    );
  }

  const firstSlot = booking.timeslots?.[0];
  const roomName = firstSlot?.location_name ?? "ห้อง";
  const locationBuilding = firstSlot
    ? `Location #${firstSlot.location_id}`
    : "–";
  const bookingDate = firstSlot
    ? new Date(firstSlot.date).toLocaleDateString("th-TH", {
        day: "2-digit",
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

  const durationHours =
    firstSlot
      ? Math.max(
          1,
          Math.round(
            (new Date(firstSlot.end_time).getTime() -
              new Date(firstSlot.start_time).getTime()) /
              3600000
          )
        )
      : 1;

  const hourlyRate = Math.round(invoice.total_amount / durationHours); // Fallback
  const actualHourlyRate = booking.base_price ? Math.round(booking.base_price / durationHours) : hourlyRate;
  const basePrice = booking.base_price || (hourlyRate * durationHours);

  const roomExpense = {
    name: `ค่าห้อง (฿${actualHourlyRate.toLocaleString("th-TH", { minimumFractionDigits: 2 })} × ${durationHours} ชั่วโมง)`,
    price: basePrice,
    quantity: 1,
  };

  const expensesList = [roomExpense];
  if (booking.booking_addons && booking.booking_addons.length > 0) {
    expensesList.push(
      ...booking.booking_addons
        // Filter out any accidentally saved "ค่าห้อง" addons to prevent duplicate
        .filter((a) => !a.addon_name.startsWith("ค่าห้อง") && !a.addon_name.startsWith("room"))
        .map((a) => ({
          name: a.addon_name,
          price: a.applied_price,
          quantity: a.quantity,
        }))
    );
  }

  return (
    <PaymentPageContrainer>
      <div className="mb-6">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปการจองของฉัน
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">ชำระเงิน</h1>
        <p className="text-sm text-slate-500 mt-1">
          Invoice #{invoice.id} · การจอง #{bookingId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <PaymentSummaryCard
          roomName={roomName}
          location={locationBuilding}
          bookingDate={bookingDate}
          bookingTime={`${startTime} - ${endTime}`}
          totalPrice={invoice.total_amount}
          expenses={expensesList}
        />

        <div className="flex flex-col gap-4">
          {qrData ? (
            <QRCodeCard
              qrCodeUrl={qrData.qr_code_url}
              accountName="มหาวิทยาลัยเทคโนโลยีสุรนารี"
              totalPrice={qrData.amount}
            />
          ) : qrError ? (
            <section className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-sm text-red-500">
              สร้าง QR ไม่สำเร็จ: {qrError}
            </section>
          ) : (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center h-56 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> กำลังสร้าง QR...
            </section>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <h3 className="font-bold text-slate-800 text-base">
                อัปโหลดหลักฐานการชำระเงิน
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                หลังจากโอนเงินแล้ว กรุณาอัปโหลดสลิปเพื่อยืนยัน
              </p>
            </div>

            <UploadZoneControlled onFileChange={setSelectedFile} />

            <div className="px-6 pb-5 flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-orange-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  ฉันยืนยันว่าได้ชำระเงินแล้ว และยอมรับนโยบายการคุ้มครองข้อมูลส่วนบุคคล
                  และเงื่อนไขการใช้งาน
                </span>
              </label>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!termsAccepted || !selectedFile || submitting}
                className={`w-full py-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${
                  termsAccepted && selectedFile && !submitting
                    ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PaymentPageContrainer>
  );
}
