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
  createPayment,
  attachSlip,
  InvoiceDTO,
} from "@/features/payment/services/payment.service";
import {
  getBookingById,
  BookingResponseDTO,
} from "@/features/bookings/services/booking.service";
import { uploadFile } from "@/lib/services/upload";
import { createDocument } from "@/features/payment/services/document.service";

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
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = useCallback(async () => {
    if (!invoice) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      let slipDocumentId: number | undefined;
      if (slipFile) {
        const uploaded = await uploadFile(slipFile, "slips");
        const doc = await createDocument({
          booking_id: bookingId,
          document_type_id: 3,
          file_name: uploaded.file_name,
          bucket_name: "payment-qr",
          object_key: uploaded.object_key,
          file_url: uploaded.url,
          content_type: uploaded.content_type,
          method_id: 2,
        });
        slipDocumentId = doc.id;
      }

      const transaction = await createPayment({
        invoice_id: invoice.id,
        amount_paid: invoice.total_amount,
        method_id: 3,
      });

      if (slipDocumentId) {
        await attachSlip(transaction.id, slipDocumentId);
      }

      router.push("/payment/success");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }, [invoice, slipFile, bookingId, router]);

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

  const hourlyRate = Math.round(invoice.total_amount / durationHours);

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
          hourlyRate={hourlyRate}
          hours={durationHours}
          totalPrice={invoice.total_amount}
        />

        <div className="flex flex-col gap-4">
          <QRCodeCard
            qrCodeUrl="/qr-code.png"
            accountName="มหาวิทยาลัยเทคโนโลยีสุรนารี"
            totalPrice={invoice.total_amount}
          />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <h3 className="font-bold text-slate-800 text-base">
                อัปโหลดหลักฐานการชำระเงิน
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                หลังจากโอนเงินแล้ว กรุณาอัปโหลดสลิปเพื่อยืนยัน
              </p>
            </div>

            <UploadZoneControlled onFileChange={setSlipFile} />

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
                disabled={!termsAccepted || submitting}
                className={`w-full py-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${
                  termsAccepted && !submitting
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
