"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking, BookingExpense } from "../../types/booking";
import { 
  Banknote, 
  X, 
  Check, 
  AlertCircle, 
  Calendar, 
  User, 
  Clock, 
  Image as ImageIcon,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ui/image-upload";
import { addonService, Addon } from "@/lib/services/addon.service";

interface PaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  bookings: Booking[];
  onUpdateBooking: (updatedBooking: Booking) => void;
}

export default function PaymentVerificationModal({
  open,
  onClose,
  bookings,
  onUpdateBooking,
}: PaymentVerificationModalProps) {
  const [activeTab, setActiveTab] = useState<"awaiting" | "verifying">("awaiting");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [slipImage, setSlipImage] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter bookings based on selected status tab — using approved as awaiting and completed as verified (legacy)
  const filteredList = bookings.filter((b) => b.status === "approved");

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [editedExpenses, setEditedExpenses] = useState<BookingExpense[]>([]);
  const [masterAddons, setMasterAddons] = useState<Addon[]>([]);

  useEffect(() => {
    if (open) {
      addonService.getAll()
        .then(setMasterAddons)
        .catch((err) => console.error("Failed to load master addons:", err));
    }
  }, [open]);

  useEffect(() => {
    if (selectedBooking) {
      setEditedExpenses(selectedBooking.expenses || []);
    } else {
      setEditedExpenses([]);
    }
    setIsEditingExpenses(false);
  }, [selectedBookingId, bookings]);

  const handleAddExpenseItem = () => {
    setEditedExpenses((prev) => [...prev, { name: "", unitPrice: 0, quantity: 1, amount: 0 }]);
  };

  const handleRemoveExpenseItem = (index: number) => {
    setEditedExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleExpenseChange = (index: number, key: "name" | "amount", value: string | number) => {
    setEditedExpenses((prev) =>
      prev.map((exp, idx) => {
        if (idx === index) {
          return {
            ...exp,
            [key]: key === "amount" ? Number(value) || 0 : value,
          };
        }
        return exp;
      })
    );
  };

  const handleSaveExpenses = () => {
    if (!selectedBooking) return;
    
    // Clean up empty items
    const cleanedExpenses = editedExpenses.filter((e) => e.name.trim() !== "");
    
    const updated: Booking = {
      ...selectedBooking,
      expenses: cleanedExpenses,
    };
    onUpdateBooking(updated);
    setIsEditingExpenses(false);
    alert("บันทึกการแก้ไขค่าใช้จ่ายเรียบร้อยแล้ว!");
  };

  const handleSimulatePayment = (bookingId: string) => {
    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    if (bookingToUpdate) {
      const updated: Booking = {
        ...bookingToUpdate,
        status: "completed",
        receiptImage: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=800",
      };
      onUpdateBooking(updated);
      alert("จำลองการแจ้งชำระเงินสำเร็จ!");
      setSelectedBookingId(null);
    }
  };

  const handleSaveReceiptImage = () => {
    if (!selectedBookingId || !slipImage) {
      alert("กรุณาอัปโหลดรูปภาพหลักฐานการชำระเงิน");
      return;
    }

    const bookingToUpdate = bookings.find((b) => b.id === selectedBookingId);
    if (bookingToUpdate) {
      const updated: Booking = {
        ...bookingToUpdate,
        receiptImage: slipImage,
      };
      onUpdateBooking(updated);
      alert("บันทึกหลักฐานการชำระเงินสำเร็จ!");
      setSlipImage("");
    }
  };

  const handleChangeReceiptImage = () => {
    if (!selectedBookingId) return;
    const bookingToUpdate = bookings.find((b) => b.id === selectedBookingId);
    if (bookingToUpdate) {
      const updated: Booking = {
        ...bookingToUpdate,
        receiptImage: undefined,
      };
      onUpdateBooking(updated);
      setSlipImage("");
    }
  };

  const handleApprovePayment = (bookingId: string) => {
    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    if (bookingToUpdate) {
      const updated: Booking = {
        ...bookingToUpdate,
        status: "approved",
      };
      onUpdateBooking(updated);
      alert("อนุมัติการชำระเงินและสิทธิ์การเข้าใช้งานห้องสำเร็จ!");
      setSelectedBookingId(null);
    }
  };

  const handleRejectPayment = (bookingId: string) => {
    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    if (bookingToUpdate) {
      const updated: Booking = {
        ...bookingToUpdate,
        status: "pending",
        receiptImage: undefined, // Clear the slip image
      };
      onUpdateBooking(updated);
      alert("ปฏิเสธการชำระเงินแล้ว");
      setSelectedBookingId(null);
    }
  };

  const calculateTotalExpenses = (bookingItem: Booking) => {
    return (bookingItem.expenses || []).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  };

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

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50 p-2 gap-2">
            <button
              onClick={() => {
                setActiveTab("awaiting");
                setSelectedBookingId(null);
                setSlipImage("");
              }}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2",
                activeTab === "awaiting"
                  ? "bg-white text-[#f26522] shadow-sm border border-slate-200/50"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              )}
            >
              รอชำระเงิน ({bookings.filter(b => b.status === "approved").length})
            </button>
            <button
              onClick={() => {
                setActiveTab("verifying");
                setSelectedBookingId(null);
                setSlipImage("");
              }}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2",
                activeTab === "verifying"
                  ? "bg-white text-[#f26522] shadow-sm border border-slate-200/50"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              )}
            >
              รอตรวจสอบการชำระเงิน ({bookings.filter(b => b.status === "completed").length})
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 flex bg-slate-50/30">
            {/* Left Side: Bookings List */}
            <div className={cn(
              "w-1/2 border-r border-slate-100 overflow-y-auto p-4 custom-scrollbar flex flex-col",
              filteredList.length === 0 ? "justify-center items-center" : "space-y-3"
            )}>
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const total = calculateTotalExpenses(item);
                  const isSelected = item.id === selectedBookingId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedBookingId(isSelected ? null : item.id);
                        setSlipImage("");
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2.5",
                        isSelected
                          ? "bg-white border-[#f26522] shadow-md shadow-[#f26522]/5 ring-1 ring-[#f26522]/10"
                          : "bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                          ID: {item.id}
                        </span>
                        <span className="text-xs font-black text-slate-800">
                          ฿ {total.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          {item.roomName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 truncate">
                          {item.building}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1 border-t border-dashed border-slate-100">
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {item.requesterName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2 select-none">
                  <AlertCircle size={28} className="text-slate-300" />
                  <span className="text-xs font-bold text-center">ไม่มีรายการคำขอจองในสถานะนี้</span>
                </div>
              )}
            </div>

            {/* Right Side: Action Panel */}
            <div className={cn(
              "w-1/2 overflow-y-auto p-6 bg-white custom-scrollbar flex flex-col",
              !selectedBooking ? "justify-center items-center" : "justify-between"
            )}>
              {selectedBooking ? (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-5 text-left">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">รายละเอียดคำขอจอง</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Booking Details</p>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">ห้อง:</span>
                        <span className="font-black text-slate-700">{selectedBooking.roomName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">ผู้ขอใช้:</span>
                        <span className="font-black text-slate-700">{selectedBooking.requesterName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">วันที่จอง:</span>
                        <span className="font-black text-slate-700">{selectedBooking.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-400">ช่วงเวลา:</span>
                        <span className="font-black text-slate-700">{selectedBooking.timeSlot}</span>
                      </div>
                      <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between font-black text-sm">
                        <span className="text-slate-700">ค่าใช้จ่ายรวม:</span>
                        <span className="text-[#f26522]">
                          ฿ {isEditingExpenses 
                            ? editedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()
                            : calculateTotalExpenses(selectedBooking).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Expenses Management Section */}
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Banknote size={14} className="text-[#f26522]" />
                          รายการค่าใช้จ่าย (Expenses)
                        </h3>
                        {!isEditingExpenses && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditedExpenses(selectedBooking.expenses || []);
                              setIsEditingExpenses(true);
                            }}
                            className="text-[10px] font-bold text-[#f26522] hover:text-[#d8561d] flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline focus:outline-none"
                          >
                            <Pencil size={10} />
                            แก้ไขค่าใช้จ่าย
                          </button>
                        )}
                      </div>

                      {isEditingExpenses ? (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {editedExpenses.map((exp, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                {exp.name && !masterAddons.some(a => a.itemName === exp.name) ? (
                                  <div className="flex-1 flex items-center gap-1 bg-white border border-slate-200 focus-within:border-[#f26522] rounded-lg pr-1">
                                    <input
                                      type="text"
                                      placeholder="ชื่อรายการระบุเอง..."
                                      value={exp.name}
                                      onChange={(e) => handleExpenseChange(idx, "name", e.target.value)}
                                      className="flex-1 h-8 px-2 bg-transparent focus:outline-none text-xs font-bold text-slate-700"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleExpenseChange(idx, "name", "")}
                                      className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
                                    >
                                      เลือกใหม่
                                    </button>
                                  </div>
                                ) : (
                                  <select
                                    value={exp.name}
                                    onChange={(e) => {
                                      if (e.target.value === "__custom__") {
                                        handleExpenseChange(idx, "name", "รายการระบุเอง");
                                      } else {
                                        const selected = masterAddons.find(a => a.itemName === e.target.value);
                                        if (selected) {
                                          handleExpenseChange(idx, "name", selected.itemName);
                                          handleExpenseChange(idx, "amount", selected.pricePerUnit);
                                        }
                                      }
                                    }}
                                    className="flex-1 h-8 px-2 bg-white border border-slate-200 focus:outline-none focus:border-[#f26522] rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                                  >
                                    <option value="">เลือกประเภทค่าใช้จ่าย...</option>
                                    {masterAddons.map((addon) => (
                                      <option key={addon.id} value={addon.itemName}>
                                        {addon.itemName} (฿{addon.pricePerUnit})
                                      </option>
                                    ))}
                                    <option value="__custom__">ระบุเอง (Custom)...</option>
                                  </select>
                                )}
                                <input
                                  type="number"
                                  placeholder="ยอดเงิน"
                                  value={exp.amount || ""}
                                  onChange={(e) => handleExpenseChange(idx, "amount", e.target.value)}
                                  className="w-20 h-8 px-2 bg-white border border-slate-200 focus:outline-none focus:border-[#f26522] rounded-lg text-xs font-bold text-slate-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExpenseItem(idx)}
                                  className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddExpenseItem}
                            className="w-full py-1.5 border border-dashed border-slate-300 hover:border-[#f26522] text-slate-500 hover:text-[#f26522] rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer bg-white"
                          >
                            <Plus size={12} />
                            เพิ่มรายการ
                          </button>

                          <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                            <Button
                              onClick={() => setIsEditingExpenses(false)}
                              variant="ghost"
                              className="flex-1 h-8 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              ยกเลิก
                            </Button>
                            <Button
                              onClick={handleSaveExpenses}
                              className="flex-1 h-8 text-[10px] font-bold bg-[#f26522] hover:bg-[#d8561d] text-white rounded-lg cursor-pointer"
                            >
                              บันทึกค่าใช้จ่าย
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] max-h-[140px] overflow-y-auto custom-scrollbar">
                          {selectedBooking.timeslots && selectedBooking.timeslots.length > 0 ? (
                            <div className="space-y-4">
                              {selectedBooking.timeslots.map((ts, idx) => (
                                <div key={ts.id || idx} className="space-y-2">
                                  <div className="font-black text-slate-700 text-xs border-b border-slate-200 pb-1 mb-2">
                                    {new Date(ts.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} ({ts.timeSlot})
                                  </div>
                                  
                                  {ts.priceSnapshot > 0 && (
                                    <div className="flex justify-between items-center text-slate-600 font-bold pl-2">
                                      <span>ค่าเช่าพื้นที่</span>
                                      <span className="text-slate-800">
                                        ฿ {ts.priceSnapshot.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {ts.expenses && ts.expenses.length > 0 && (
                                    ts.expenses.map((exp, eIdx) => (
                                      <div key={eIdx} className="flex justify-between items-center text-slate-600 font-bold pl-2">
                                        <span>{exp.name} {exp.quantity > 1 ? `(x${exp.quantity})` : ''}</span>
                                        <span className={cn(exp.amount < 0 ? "text-emerald-600" : "text-slate-800")}>
                                          {exp.amount < 0 ? "-" : ""} ฿ {Math.abs(exp.amount).toLocaleString()}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            selectedBooking.expenses && selectedBooking.expenses.length > 0 ? (
                              selectedBooking.expenses.map((exp, idx) => (
                                <div key={idx} className="flex justify-between items-center text-slate-600 font-bold">
                                  <span>{exp.name}</span>
                                  <span className={cn(exp.amount < 0 ? "text-emerald-600" : "text-slate-800")}>
                                    {exp.amount < 0 ? "-" : ""} ฿ {Math.abs(exp.amount).toLocaleString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-slate-400 py-1 font-bold">ไม่มีรายการค่าใช้จ่าย</div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action inputs based on status */}
                    {activeTab === "awaiting" && (
                      <div className="space-y-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                        <h4 className="text-xs font-black text-slate-700 font-bold">จำลองการชำระเงินโดยผู้ใช้งาน</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          ผู้ใช้งานทั่วไปจะเห็นแบบฟอร์มให้โอนเงินตามยอดที่ระบุ และแนบภาพสลิป ในฐานะแอดมิน คุณสามารถคลิกปุ่มด้านล่างเพื่อจำลองการแจ้งชำระเงินสำเร็จ (โดยไม่ต้องแนบรูปสลิปก่อน) ซึ่งจะส่งรายการนี้ไปที่แท็บ <strong>"รอตรวจสอบการชำระเงิน"</strong> เพื่อดำเนินการต่อ
                        </p>
                      </div>
                    )}

                    {activeTab === "verifying" && (
                      <div className="space-y-3">
                        {selectedBooking.receiptImage ? (
                          <>
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-black text-slate-700 font-bold">หลักฐานการชำระเงินที่แนบมา</h4>
                              <div className="flex items-center gap-3">
                                <a
                                  href={selectedBooking.receiptImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <ExternalLink size={10} />
                                  เปิดดูไฟล์หลักฐาน
                                </a>
                                <button
                                  onClick={handleChangeReceiptImage}
                                  className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                                >
                                  เปลี่ยนรูปภาพหลักฐาน
                                </button>
                              </div>
                            </div>
                            <div 
                              onClick={() => setPreviewImage(selectedBooking.receiptImage || null)}
                              className="relative aspect-[3/4] max-h-[160px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in group shadow-sm"
                            >
                              <img
                                src={selectedBooking.receiptImage}
                                alt="Slip Receipt"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                คลิกเพื่อขยายรูปสลิป
                              </div>
                            </div>

                            {/* Official Receipt Section */}
                            <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black text-slate-700 font-bold">
                                  ใบเสร็จรับเงินอย่างเป็นทางการ (Official Receipt)
                                </h4>
                                {selectedBooking.officialReceipt && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated: Booking = {
                                        ...selectedBooking,
                                        officialReceipt: undefined,
                                      };
                                      onUpdateBooking(updated);
                                    }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer focus:outline-none bg-transparent border-none p-0"
                                  >
                                    ลบใบเสร็จ
                                  </button>
                                )}
                              </div>

                              {selectedBooking.officialReceipt ? (
                                <div 
                                  onClick={() => setPreviewImage(selectedBooking.officialReceipt || null)}
                                  className="relative aspect-[3/4] max-h-[160px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in group shadow-sm"
                                >
                                  <img
                                    src={selectedBooking.officialReceipt}
                                    alt="Official Receipt"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                    คลิกเพื่อขยายรูปใบเสร็จ
                                  </div>
                                </div>
                              ) : (
                                <ImageUpload
                                  value=""
                                  onChange={(url) => {
                                    if (url) {
                                      const updated: Booking = {
                                        ...selectedBooking,
                                        officialReceipt: url,
                                      };
                                      onUpdateBooking(updated);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-xs font-black text-slate-700 font-bold">แนบหลักฐานชำระเงิน</h4>
                              <p className="text-[9px] font-bold text-slate-400 leading-normal mt-0.5">
                                * รายการนี้จองและแจ้งชำระเงินผ่านระบบจำลอง คุณสามารถอัปโหลดภาพหลักฐานการชำระเงินเพื่อยืนยันได้ที่นี่
                              </p>
                            </div>
                            <ImageUpload
                              value={slipImage}
                              onChange={setSlipImage}
                            />
                            {slipImage && (
                              <Button
                                onClick={handleSaveReceiptImage}
                                className="w-full h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                              >
                                <Check size={14} strokeWidth={2.5} />
                                บันทึกรูปภาพหลักฐาน
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center gap-3">
                    {activeTab === "awaiting" ? (
                      <Button
                        onClick={() => handleSimulatePayment(selectedBooking.id)}
                        className="w-full h-11 rounded-lg bg-[#f26522] hover:bg-[#d8561d] text-white font-bold text-xs shadow-md shadow-[#f26522]/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check size={14} strokeWidth={2.5} />
                        แจ้งชำระเงิน (จำลอง)
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => handleRejectPayment(selectedBooking.id)}
                          className="flex-1 h-11 rounded-lg font-bold text-xs text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-red-200/50"
                        >
                          ปฏิเสธสลิปนี้
                        </Button>
                        <Button
                          onClick={() => handleApprovePayment(selectedBooking.id)}
                          className="flex-1 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          อนุมัติการจอง
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2 select-none">
                  <AlertCircle size={28} className="text-slate-300" />
                  <p className="text-xs font-bold text-center">กรุณาเลือกรายการจองเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={(isOpen) => !isOpen && setPreviewImage(null)}>
          <DialogContent className="w-auto max-w-[90vw] max-h-[90vh] p-1 border-none bg-black rounded-lg overflow-hidden transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 flex items-center justify-center shadow-2xl">
            <DialogTitle className="sr-only">แสดงรูปภาพหลักฐานการชำระเงิน</DialogTitle>
            <DialogDescription className="sr-only">รายละเอียดรูปภาพสลิปที่อัปโหลดโดยผู้ขอจอง</DialogDescription>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer transition-colors shadow-md z-50 border border-white/10"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Payment Slip Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

