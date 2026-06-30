"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getBookingById,
  updateBookingExpenses,
  updateBookingStatus,
  BookingResponseDTO,
} from "@/features/bookings/services/booking.service";
import { addonService, Addon } from "@/lib/services/addon.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  User,
  Save,
  Trash2,
  Plus,
  UploadCloud,
  Eye,
  Lock,
  Receipt,
  X,
  Search,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExpenseRow {
  id?: number; // addon id from master (if from addon service)
  name: string;
  price: number;
  quantity: number;
  locked?: boolean; // room cost row is locked
  isDiscount?: boolean; // discount rows
}

export default function BookingExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params?.id as string;
  const bookingId = parseInt(idStr, 10);

  const [booking, setBooking] = useState<BookingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Room cost (booking level)
  const [roomCostPrice, setRoomCostPrice] = useState(0);
  // Global discount
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Per timeslot addons state
  interface TimeslotData {
    id: number;
    date: string;
    timeStart: string;
    timeEnd: string;
    durationHours: number;
    priceSnapshot: number;
    otherExpenses: ExpenseRow[];
    discounts: ExpenseRow[];
  }
  const [timeslotsData, setTimeslotsData] = useState<TimeslotData[]>([]);

  // Addon picker modal
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [activeTimeslotIdForAddon, setActiveTimeslotIdForAddon] = useState<number | null>(null);

  // Payment slip from booking
  const [receiptSlip, setReceiptSlip] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);


  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonSearch, setAddonSearch] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then((data) => {
        setBooking(data);

        // Set room cost from base_price or fallback to sum of price_snapshot
        let computedBasePrice = data.base_price || 0;
        if (computedBasePrice === 0 && data.timeslots) {
          computedBasePrice = data.timeslots.reduce((sum, ts) => sum + (ts.price_snapshot || 0), 0);
        }
        setRoomCostPrice(computedBasePrice);

        // Calculate old discounts from addons if discount_price is 0
        let oldAddonDiscounts = 0;
        if (data.timeslots) {
          data.timeslots.forEach((ts) => {
            if (ts.addons) {
              ts.addons.forEach((a) => {
                const name = a.addon_name.toLowerCase();
                if (name.includes("ส่วนลด") || name.includes("discount")) {
                  oldAddonDiscounts += Math.abs(a.applied_price * a.quantity);
                }
              });
            }
          });
        }
        
        // Set global discount
        setGlobalDiscount(data.discount_price || oldAddonDiscounts || 0);

        // Parse payment slip
        if ((data as any).receipt_image) {
          setReceiptSlip((data as any).receipt_image);
        }

        if (data.timeslots) {
          const mappedTimeslots = data.timeslots.map(ts => {
            const tsOtherExpenses: ExpenseRow[] = [];
            const tsDiscounts: ExpenseRow[] = [];
            
            if (ts.addons) {
              ts.addons.forEach((a) => {
                const isDiscount =
                  a.addon_name.toLowerCase().includes("ส่วนลด") ||
                  a.addon_name.toLowerCase().includes("discount");
                const isRoom =
                  a.addon_name.startsWith("ค่าห้อง") ||
                  a.addon_name.startsWith("room");

                if (!isRoom) {
                  if (isDiscount) {
                    tsDiscounts.push({
                      name: a.addon_name,
                      price: Math.abs(a.applied_price),
                      quantity: a.quantity,
                      isDiscount: true,
                    });
                  } else {
                    tsOtherExpenses.push({
                      name: a.addon_name,
                      price: a.applied_price,
                      quantity: a.quantity,
                    });
                  }
                }
              });
            }

            const durationHours = (ts.start_time && ts.end_time)
              ? Math.max(1, Math.round((new Date(ts.end_time).getTime() - new Date(ts.start_time).getTime()) / 3600000))
              : 1;

            return {
              id: ts.id,
              date: new Date(ts.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              timeStart: new Date(ts.start_time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              timeEnd: new Date(ts.end_time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              durationHours,
              priceSnapshot: ts.price_snapshot || 0,
              otherExpenses: tsOtherExpenses,
              discounts: tsDiscounts
            };
          });
          setTimeslotsData(mappedTimeslots);
        }
      })
      .catch((err) => console.error("Error fetching booking", err))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Load addons when modal opens
  useEffect(() => {
    if (addonModalOpen && addons.length === 0) {
      addonService
        .getAll()
        .then(setAddons)
        .catch((err) => console.error("Failed to load addons", err));
    }
  }, [addonModalOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const timeslotPayloads = timeslotsData.map(ts => {
        const allExpenses = [
          ...ts.otherExpenses.map((e) => ({
            addon_name: e.name,
            applied_price: e.price,
            quantity: e.quantity,
          })),
        ];
        return {
          timeslot_id: ts.id,
          expenses: allExpenses
        };
      });

      await updateBookingExpenses(bookingId, { 
        discount_price: globalDiscount,
        timeslots: timeslotPayloads 
      });

      toast.success("บันทึกการเปลี่ยนแปลงสำเร็จ", {
        description: "ข้อมูลค่าใช้จ่ายถูกบันทึกเรียบร้อยแล้ว",
      });
      router.back();
    } catch (error) {
      console.error("Failed to update expenses", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก", {
        description: "ไม่สามารถบันทึกค่าใช้จ่ายได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add expense from addon picker
  const handleSelectAddon = (addon: any) => {
    const addonName = addon.itemName || addon.name || addon.item_name || "ไม่มีชื่อ";
    const addonPrice = addon.default_price || addon.pricePerUnit || addon.price || addon.price_per_unit || 0;
    
    setTimeslotsData(prev => prev.map(ts => {
      if (ts.id === activeTimeslotIdForAddon) {
        return {
          ...ts,
          otherExpenses: [
            ...ts.otherExpenses,
            { id: addon.id, name: addonName, price: addonPrice, quantity: 1 }
          ]
        };
      }
      return ts;
    }));
    setAddonModalOpen(false);
  };

  const removeOtherExpense = (tsId: number, idx: number) => {
    setTimeslotsData(prev => prev.map(ts => {
      if (ts.id === tsId) {
        return { ...ts, otherExpenses: ts.otherExpenses.filter((_, i) => i !== idx) };
      }
      return ts;
    }));
  };

  const updateOtherExpense = (tsId: number, idx: number, field: keyof ExpenseRow, value: any) => {
    setTimeslotsData(prev => prev.map(ts => {
      if (ts.id === tsId) {
        return {
          ...ts,
          otherExpenses: ts.otherExpenses.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
        };
      }
      return ts;
    }));
  };

  // Global discount functions removed

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center space-y-3">
          <div className="size-8 rounded-full border-2 border-[#f26522] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  if (!booking)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        ไม่พบข้อมูลการจอง
      </div>
    );

  const roomName =
    booking.timeslots?.[0]?.location_name || "ไม่ทราบชื่อห้อง";
  const dateRaw = booking.timeslots?.[0]?.date;
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";
  const timeStartStr = booking.timeslots?.[0]?.start_time;
  const timeEndStr = booking.timeslots?.[0]?.end_time;
  const timeStart = timeStartStr
    ? new Date(timeStartStr).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--:--";
  const timeEnd = timeEndStr
    ? new Date(timeEndStr).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--:--";
  const time = `${timeStart} - ${timeEnd} น.`;

  // roomTotal is no longer used globally since it's computed per timeslot
  
  let otherTotal = 0;
  timeslotsData.forEach(ts => {
    otherTotal += ts.otherExpenses.reduce((s, e) => s + e.price * e.quantity, 0);
  });

  const subtotal = roomCostPrice + otherTotal;
  const isWaived = subtotal > 0 && globalDiscount === subtotal;
  const grandTotal = subtotal - globalDiscount;

  const filteredAddons = addons.filter((a: any) => {
    const itemName = a.itemName || a.name || a.item_name || "";
    return itemName.toLowerCase().includes(addonSearch.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc]">
      <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                จัดการค่าใช้จ่าย –{" "}
                <span className="text-[#f26522]">{roomName}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                รายละเอียดงบประมาณและข้อมูลการจองสำหรับเจ้าหน้าที่
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#f26522] hover:bg-[#dc521a] text-white rounded-[7px] font-bold h-11 px-6 shadow-md gap-2 cursor-pointer"
          >
            {saving ? (
              <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save size={16} />
            )}
            บันทึกการเปลี่ยนแปลง
          </Button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ───── Left column ───── */}
          <div className="space-y-5">
            {/* Booking summary */}
            <Card className="p-5 border-slate-100 shadow-sm rounded-2xl">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                สรุปข้อมูลการจอง
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-slate-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      วันที่จอง
                    </p>
                    <p className="text-sm font-black text-slate-900">{date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-slate-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      เวลา
                    </p>
                    <p className="text-sm font-black text-slate-900">{time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-slate-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      ผู้ขอใช้บริการ
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {booking.requester_name || booking.user_name}
                    </p>
                    {booking.contact_email && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {booking.contact_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* ───── Right column ───── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Expense table */}
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 bg-white flex justify-between items-center border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">
                  รายละเอียดค่าใช้จ่าย
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%]">
                        รายการ
                      </th>
                      <th className="py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[18%]">
                        ราคาต่อหน่วย
                      </th>
                      <th className="py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[18%]">
                        จำนวน
                      </th>
                      <th className="py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-[18%]">
                        รวม
                      </th>
                      <th className="py-3.5 px-3 w-[6%]" />
                    </tr>
                  </thead>
                  <tbody>
                    {timeslotsData.map((ts, index) => {
                      const isDaily = ts.durationHours > 4;
                      const roomLabel = isDaily ? "ค่าห้อง (เหมาวัน)" : "ค่าห้อง";
                      const unitPrice = isDaily ? ts.priceSnapshot : (ts.priceSnapshot ? Math.round(ts.priceSnapshot / ts.durationHours) : 0);
                      const quantityText = isDaily ? "1 วัน" : `${ts.durationHours} ชม.`;

                      return (
                      <React.Fragment key={ts.id}>
                        <tr className="bg-slate-50/50 border-y border-slate-100">
                          <td colSpan={5} className="py-2 px-5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-500">
                                Timeslot {index + 1}: {ts.date} ({ts.timeStart} - {ts.timeEnd})
                              </span>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    setActiveTimeslotIdForAddon(ts.id);
                                    setAddonModalOpen(true);
                                  }}
                                  className="text-[11px] font-bold text-[#f26522] hover:underline cursor-pointer"
                                >
                                  + เพิ่มรายการ
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* ── Room cost row (locked, per timeslot) ── */}
                        <tr className="border-b border-slate-100 bg-slate-50/30">
                          <td className="py-4 px-5 pl-8">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">
                                {roomLabel}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex justify-center">
                              <div className="w-24 text-center flex items-center justify-center">
                                <span className="text-sm font-bold text-slate-500">
                                  {unitPrice.toLocaleString("en-US")}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex justify-center">
                              <div className="w-16 text-center flex items-center justify-center">
                                <span className="text-sm text-slate-600">{quantityText}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right font-black text-slate-900">
                            {ts.priceSnapshot.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-4 px-3">
                            {/* no delete for room cost */}
                          </td>
                        </tr>

                        {/* ── Other expenses ── */}
                        {ts.otherExpenses.map((exp, idx) => (
                          <tr
                            key={`other-${ts.id}-${idx}`}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-3 px-5 pl-8">
                              <Input
                                value={exp.name}
                                onChange={(e) =>
                                  updateOtherExpense(ts.id, idx, "name", e.target.value)
                                }
                                placeholder="ชื่อรายการ"
                                className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-[#f26522] shadow-none rounded-[7px] font-bold text-slate-900 text-sm"
                              />
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex justify-center">
                                <Input
                                  type="number"
                                  value={exp.price}
                                  onChange={(e) =>
                                    updateOtherExpense(
                                      ts.id,
                                      idx,
                                      "price",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-9 w-24 border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-[#f26522] shadow-none rounded-[7px] text-sm font-bold text-[#f26522] text-center"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex justify-center">
                                <Input
                                  type="number"
                                  value={exp.quantity}
                                  onChange={(e) =>
                                    updateOtherExpense(
                                      ts.id,
                                      idx,
                                      "quantity",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="h-9 w-16 border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-[#f26522] shadow-none rounded-[7px] text-center text-sm"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-5 text-right font-black text-slate-900">
                              {(exp.price * exp.quantity).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => removeOtherExpense(ts.id, idx)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}

                      </React.Fragment>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              {/* Summary footer */}
              <div className="bg-slate-50 p-5 flex flex-col items-end gap-2.5 border-t border-slate-100">
                <div className="flex justify-between w-72 text-sm">
                  <span className="text-slate-500 font-bold">ยอดรวมสุทธิ:</span>
                  <span className="text-slate-700 font-black">
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </span>
                </div>
                <div className="flex justify-between w-72 text-sm items-center">
                  <span className="text-emerald-600 font-bold">ส่วนลดรวม:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black">−</span>
                    <Input
                      type="number"
                      value={globalDiscount || ""}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      disabled={isWaived}
                      className={cn(
                        "h-8 w-24 border-slate-200 focus:border-emerald-500 rounded-[5px] text-right font-bold text-emerald-600 shadow-sm transition-opacity",
                        isWaived && "opacity-50 bg-slate-100"
                      )}
                    />
                    <span className="text-emerald-600 font-bold text-xs">บาท</span>
                  </div>
                </div>

                <div className="flex justify-end w-72 mt-2 mb-1">
                  <div className="flex items-center space-x-2 bg-slate-100/50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer" onClick={() => setGlobalDiscount(isWaived ? 0 : subtotal)}>
                    <Checkbox 
                      id="waive-fee" 
                      checked={isWaived} 
                      onCheckedChange={(checked) => setGlobalDiscount(checked ? subtotal : 0)}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <label
                      htmlFor="waive-fee"
                      className="text-sm font-bold text-slate-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ยกเว้นค่าบริการทั้งหมด (ฟรี)
                    </label>
                  </div>
                </div>

                <div className="flex justify-between w-72 text-base pt-3 border-t border-slate-200 mt-1">
                  <span className="text-slate-900 font-black">
                    ยอดชำระทั้งหมด:
                  </span>
                  <span className="text-[#f26522] font-black text-lg">
                    {grandTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Addon Picker Modal ── */}
      <Dialog open={addonModalOpen} onOpenChange={setAddonModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900">
              เพิ่มรายการค่าใช้จ่าย
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1">
              เลือกรายการจาก Location Addon
            </p>
          </DialogHeader>
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={addonSearch}
                onChange={(e) => setAddonSearch(e.target.value)}
                placeholder="ค้นหารายการ..."
                className="pl-9 h-10 rounded-[7px] bg-slate-50 border-transparent focus:bg-white focus:border-[#f26522] text-sm"
              />
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {filteredAddons.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                ไม่พบรายการ
              </p>
            ) : (
              filteredAddons.map((addon: any) => {
                const itemName = addon.itemName || addon.name || addon.item_name || "ไม่มีชื่อ";
                const price = addon.default_price || addon.pricePerUnit || addon.price || addon.price_per_unit || 0;
                
                return (
                  <button
                    key={addon.id}
                    onClick={() => handleSelectAddon(addon)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#f26522]/30 hover:bg-[#f26522]/5 transition-all text-left cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#f26522]">
                        {itemName}
                      </p>
                      {addon.subtext && (
                        <p className="text-xs text-slate-400">{addon.subtext}</p>
                      )}
                    </div>
                    <span className="text-sm font-black text-[#f26522]">
                      {price.toLocaleString("en-US")} ฿
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setAddonModalOpen(false)}
              className="w-full rounded-[7px] h-11 font-bold border-slate-200 text-slate-600 cursor-pointer"
            >
              ยกเลิก
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
