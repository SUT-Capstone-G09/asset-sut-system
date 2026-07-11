"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  X,
  Check,
  AlertCircle,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUpload from "@/features/space-rental/components/shared/ImageUpload";
import { PaymentTransactionDTO, verifyPayment } from "@/features/payment/services/payment.service";
import { getBookingById, BookingResponseDTO } from "@/features/bookings/services/booking.service";
import { getDocumentById, createDocument, DocumentDTO } from "@/features/payment/services/document.service";
import { uploadFile, UPLOAD_FOLDERS } from "@/lib/services/upload";

interface AdminPaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentTransactionDTO | null;
  onVerified: () => void;
}

export default function AdminPaymentVerificationModal({
  open,
  onClose,
  payment,
  onVerified,
}: AdminPaymentVerificationModalProps) {
  const [booking, setBooking] = useState<BookingResponseDTO | null>(null);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open && payment) {
      loadData(payment);
    } else {
      setBooking(null);
      setSlipImage(null);
      setReceiptImage(null);
      setSelectedReceiptFile(null);
      setLocalPreview(null);
    }
  }, [open, payment]);

  const loadData = async (pay: PaymentTransactionDTO) => {
    setLoading(true);
    try {
      const bData = await getBookingById(pay.booking_id);
      setBooking(bData);

      // Check if there is an official receipt in documents
      const receiptDoc = bData.documents?.find(
        (d) => d.document_type === "payment_receipt" || d.file_url.includes("payment-receipt") || d.file_url.includes("ใบเสร็จรับเงิน") || d.file_url.includes("%E0%B9%83%E0%B8%9A%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B9%87%E0%B8%88%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B9%80%E0%B8%87%E0%B8%B4%E0%B8%99")
      );
      if (receiptDoc) {
        setReceiptImage(receiptDoc.file_url);
      } else {
        setReceiptImage(null);
      }

      // Fetch slip image
      if (pay.slip_document_id) {
        const sData = await getDocumentById(pay.slip_document_id);
        setSlipImage(sData.file_url);
      } else {
        setSlipImage(null);
      }
    } catch (error) {
      console.error("Failed to load booking or document details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (statusId: number) => {
    if (!payment) return;
    setActioning(true);
    try {
      await verifyPayment(payment.id, { status_id: statusId });
      onVerified();
      // Optional: don't close immediately if approved, so they can upload receipt
      if (statusId === 3) {
        onClose(); // Close if rejected
      } else {
        // If approved, update local state to show receipt upload section
        payment.status = "approved";
        payment.status_id = 2;
      }
    } catch (error) {
      console.error("Failed to verify payment", error);
    } finally {
      setActioning(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!booking || !selectedReceiptFile) return;
    setUploadingReceipt(true);
    try {
      const firstSlot = booking?.timeslots?.[0];
      const bDateStr = firstSlot?.date ? firstSlot.date.slice(0, 10) : undefined;
      const locName = firstSlot?.location_name;

      // 1. Upload to MinIO
      const uploadRes = await uploadFile(selectedReceiptFile, UPLOAD_FOLDERS.PAYMENT_RECEIPT, bDateStr, locName, booking.id);

      // 2. Create Document in DB
      await createDocument({
        booking_id: booking.id,
        document_type_id: 4, 
        file_name: uploadRes.file_name,
        bucket_name: uploadRes.bucket_name,
        object_key: uploadRes.object_key,
        file_url: uploadRes.url,
        content_type: uploadRes.content_type,
        method_id: 1, // upload
      });

      setReceiptImage(uploadRes.url);
      setSelectedReceiptFile(null);
      setLocalPreview(null);
    } catch (error) {
      console.error("Failed to upload receipt", error);
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (!open) return null;

  const isPending = payment?.status === "pending";
  const isApproved = payment?.status === "approved";

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[800px] sm:max-w-[800px] p-0 border-none bg-white rounded-[24px] shadow-2xl flex flex-col h-[650px] overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="bg-[#f26522] px-6 py-5 flex flex-row items-center justify-between text-white shrink-0 relative text-left">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Banknote size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  ระบบตรวจสอบการชำระเงิน
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-0.5">
                  Payment Verification Dashboard (Admin Only)
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-[7px] text-black hover:bg-black/20 hover:text-black transition-all flex items-center justify-center group cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X size={18} className="transition-transform group-hover:rotate-90 text-white" />
            </button>
          </DialogHeader>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={32} className="animate-spin text-brand-primary" />
              <span className="text-sm">กำลังโหลดข้อมูล...</span>
            </div>
          ) : !booking ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 select-none">
              <AlertCircle size={28} className="text-slate-300" />
              <p className="text-xs font-bold text-center">ไม่พบข้อมูลการจองที่เกี่ยวข้อง</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex bg-slate-50/30">
              {/* Left Side: Booking & Expenses Info */}
              <div className="w-1/2 border-r border-slate-100 overflow-y-auto p-6 bg-white custom-scrollbar flex flex-col">
                <div className="space-y-5 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">รายละเอียดคำขอจอง</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Booking Details
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">ห้อง:</span>
                      <span className="font-black text-slate-700">
                        {booking.timeslots[0]?.location_name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">ผู้ขอใช้:</span>
                      <span className="font-black text-slate-700">
                        {booking.requester_name || booking.user_name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">วันที่จอง:</span>
                      <span className="font-black text-slate-700">
                        {booking.timeslots[0]
                          ? new Date(booking.timeslots[0].date).toLocaleDateString("th-TH")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">ช่วงเวลา:</span>
                      <span className="font-black text-slate-700">
                        {booking.timeslots[0]
                          ? `${new Date(booking.timeslots[0].start_time).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} - ${new Date(booking.timeslots[0].end_time).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} น.`
                          : "-"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between font-black text-sm">
                      <span className="text-slate-700">ยอดชำระรวม:</span>
                      <span className="text-[#f26522]">
                        ฿ {(payment?.amount_paid || booking.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Expenses Read-Only Section */}
                  <div className="space-y-3 mt-4">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <Banknote size={14} className="text-[#f26522]" />
                      รายการค่าใช้จ่าย (Expenses)
                    </h3>

                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] max-h-[140px] overflow-y-auto custom-scrollbar">
                      {booking.timeslots && booking.timeslots.length > 0 ? (
                        <div className="space-y-4">
                          {booking.timeslots.map((ts, idx) => (
                            <div key={ts.id || idx} className="space-y-2">
                              <div className="font-black text-slate-700 text-xs border-b border-slate-200 pb-1 mb-2">
                                {new Date(ts.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} ({new Date(ts.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - {new Date(ts.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.)
                              </div>
                              
                              {ts.price_snapshot > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-bold pl-2">
                                  <span>ค่าเช่าพื้นที่</span>
                                  <span className="text-slate-800">
                                    ฿ {ts.price_snapshot.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              
                              {ts.addons && ts.addons.length > 0 && (
                                ts.addons.map((addon) => (
                                  <div key={addon.id} className="flex justify-between items-center text-slate-600 font-bold pl-2">
                                    <span>{addon.addon_name} (x{addon.quantity})</span>
                                    <span className={cn(addon.applied_price < 0 ? "text-emerald-600" : "text-slate-800")}>
                                      {addon.applied_price < 0 ? "-" : ""} ฿ {Math.abs(addon.total_price).toLocaleString()}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {booking.base_price > 0 && (
                            <div className="flex justify-between items-center text-slate-600 font-bold">
                              <span>ค่าเช่าพื้นที่</span>
                              <span className="text-slate-800">
                                ฿ {booking.base_price.toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {booking.booking_addons && booking.booking_addons.length > 0 ? (
                            booking.booking_addons.map((addon) => (
                              <div key={addon.id} className="flex justify-between items-center text-slate-600 font-bold">
                                <span>{addon.addon_name} (x{addon.quantity})</span>
                                <span
                                  className={cn(
                                    addon.applied_price < 0 ? "text-emerald-600" : "text-slate-800"
                                  )}
                                >
                                  {addon.applied_price < 0 ? "-" : ""} ฿ {Math.abs(addon.total_price).toLocaleString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            booking.base_price === 0 && <div className="text-center text-slate-400 py-1 font-bold">ไม่มีรายการค่าใช้จ่าย</div>
                          )}
                        </>
                      )}
                      
                      {booking.total_price === 0 && (booking.base_price > 0 || booking.addon_price > 0) && (
                        <div className="flex justify-between items-center text-slate-600 font-bold pt-1 border-t border-dashed border-slate-200 mt-1">
                          <span>ส่วนลด / ยกเว้นค่าบริการ</span>
                          <span className="text-emerald-600">
                            - ฿ {(booking.base_price + booking.addon_price).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Slip & Actions */}
              <div className="w-1/2 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Payment Slip */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-slate-700 font-bold">
                        หลักฐานการชำระเงินที่แนบมา
                      </h4>
                      {slipImage && (
                        <a
                          href={slipImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink size={10} />
                          เปิดดูไฟล์ต้นฉบับ
                        </a>
                      )}
                    </div>

                    {slipImage ? (
                      <div
                        onClick={() => setPreviewImage(slipImage)}
                        className="relative aspect-[3/4] max-h-[220px] rounded-xl overflow-hidden border border-slate-200 bg-white cursor-zoom-in group shadow-sm flex justify-center items-center"
                      >
                        <img
                          src={slipImage}
                          alt="Payment Slip"
                          className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          คลิกเพื่อขยายรูปสลิป
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[220px] border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400">
                        <AlertCircle size={24} className="mb-2" />
                        <span className="text-xs font-semibold">ไม่มีรูปภาพสลิปชำระเงิน</span>
                      </div>
                    )}
                  </div>

                  {/* Official Receipt Upload (Only when approved) */}
                  {isApproved && (
                    <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-700 font-bold">
                          ใบเสร็จรับเงินอย่างเป็นทางการ (Official Receipt)
                        </h4>
                      </div>

                      {receiptImage ? (
                        <div className="space-y-2">
                          <div
                            onClick={() => setPreviewImage(receiptImage)}
                            className="relative aspect-video max-h-[180px] w-full rounded-[7px] overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in group shadow-sm flex justify-center items-center"
                          >
                            <img
                              src={receiptImage}
                              alt="Official Receipt"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                              คลิกเพื่อขยายรูปใบเสร็จ
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 px-3"
                              onClick={() => setReceiptImage(null)}
                            >
                              อัปโหลดใบเสร็จใหม่
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {uploadingReceipt && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                              <Loader2 size={24} className="animate-spin text-brand-primary" />
                            </div>
                          )}
                          {!localPreview ? (
                            <div
                              onClick={() => document.getElementById('receipt-upload')?.click()}
                              className="border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center gap-5 transition-all cursor-pointer group shadow-sm border-slate-200 bg-slate-50/80 hover:bg-slate-100/50 hover:border-[#f26522]/40"
                            >
                              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                <Upload size={28} className="text-[#f26522]" />
                              </div>
                              <div className="text-center space-y-1.5">
                                <p className="text-[15px] font-bold tracking-tight transition-colors text-slate-800 group-hover:text-[#f26522]">
                                  คลิกเพื่อเลือกไฟล์ใบเสร็จ
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">รองรับ JPG, PNG (สูงสุด 10MB)</p>
                              </div>
                              <input
                                id="receipt-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedReceiptFile(file);
                                    setLocalPreview(URL.createObjectURL(file));
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="relative aspect-video max-h-[180px] w-full rounded-[7px] overflow-hidden border border-slate-200 bg-slate-50 shadow-sm flex justify-center items-center">
                                <img
                                  src={localPreview}
                                  alt="Local Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={() => {
                                      setSelectedReceiptFile(null);
                                      setLocalPreview(null);
                                    }}
                                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              <Button
                                onClick={handleUploadReceipt}
                                disabled={uploadingReceipt}
                                className="w-full bg-[#f26522] hover:bg-[#e05412] text-white font-bold h-10"
                              >
                                {uploadingReceipt ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin mr-2" /> กำลังบันทึก...
                                  </>
                                ) : (
                                  "อัปโหลดใบเสร็จ"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-200/60 mt-6 flex items-center gap-3">
                  {isPending ? (
                    <>
                      <Button
                        variant="ghost"
                        disabled={actioning}
                        onClick={() => handleVerify(3)}
                        className="flex-1 h-11 rounded-lg font-bold text-xs text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-red-200/50 disabled:opacity-50"
                      >
                        {actioning ? <Loader2 size={14} className="animate-spin" /> : "ปฏิเสธสลิปนี้"}
                      </Button>
                      <Button
                        disabled={actioning}
                        onClick={() => handleVerify(2)}
                        className="flex-1 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {actioning ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
                        อนุมัติสลิปการจอง
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full h-11 rounded-lg font-bold text-xs transition-all cursor-pointer"
                    >
                      ปิดหน้าต่าง
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={(isOpen) => !isOpen && setPreviewImage(null)}>
          <DialogContent className="w-auto max-w-[90vw] max-h-[90vh] p-1 border-none bg-black rounded-lg overflow-hidden transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 flex items-center justify-center shadow-2xl">
            <DialogTitle className="sr-only">แสดงรูปภาพ</DialogTitle>
            <DialogDescription className="sr-only">แสดงรูปภาพ</DialogDescription>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer transition-colors shadow-md z-50 border border-white/10"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
