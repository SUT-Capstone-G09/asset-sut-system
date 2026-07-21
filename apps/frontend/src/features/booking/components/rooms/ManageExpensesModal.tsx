"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Clock,
  CalendarDays,
  ChevronDown,
  Settings2,
  ListChecks,
  Users,
  Check,
} from "lucide-react";
import { addonService, Addon as Expense } from "@/lib/services/addon.service";
import AddExpenseModal from "./AddExpenseModal";
import { Badge } from "@/components/ui/badge";

// ──────────────────────────────────────────────
// Mockup capacity data
// ──────────────────────────────────────────────
const MOCK_CAPACITIES = [
  { id: 1, label: "20 คน", capacity: 20 },
  { id: 2, label: "50 คน", capacity: 50 },
  { id: 3, label: "100 คน", capacity: 100 },
  { id: 4, label: "200 คน", capacity: 200 },
];

interface RateForm {
  hourlyInternal: string;
  hourlyExternal: string;
  dailyInternal: string;
  dailyExternal: string;
}

const DEFAULT_RATE: RateForm = {
  hourlyInternal: "200",
  hourlyExternal: "500",
  dailyInternal: "1500",
  dailyExternal: "3500",
};

type TabKey = "expenses" | "rates";

interface ManageExpensesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageExpensesModal({
  open,
  onClose,
}: ManageExpensesModalProps) {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<TabKey>("expenses");

  // ── Expenses tab state ──
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // ── Rate tab state ──
  const [selectedCapacity, setSelectedCapacity] = useState(MOCK_CAPACITIES[0]);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [rateForm, setRateForm] = useState<RateForm>(DEFAULT_RATE);
  const [rateSaved, setRateSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      addonService
        .getAll()
        .then(setExpenses)
        .catch((err) => console.error("Failed to load expenses:", err))
        .finally(() => setIsLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveTab("expenses");
      setCapacityOpen(false);
      setRateSaved(false);
    }
  }, [open]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) =>
      exp.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredExpenses, currentPage, totalPages]);

  const handleAddExpense = async (newExpense: Omit<Expense, "id">) => {
    try {
      const created = await addonService.create(newExpense);
      setExpenses((prev) => [created, ...prev]);
      setSearchQuery("");
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเพิ่มค่าใช้จ่ายได้");
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    try {
      const updated = await addonService.update(updatedExpense.id, updatedExpense);
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === updated.id ? updated : exp))
      );
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถแก้ไขค่าใช้จ่ายได้");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
      await addonService.delete(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      const newLen = filteredExpenses.length - 1;
      const newTotal = Math.ceil(newLen / itemsPerPage) || 1;
      if (currentPage > newTotal) setCurrentPage(newTotal);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบค่าใช้จ่ายได้");
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsAddOpen(true);
  };

  const handleRateSave = () => {
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2500);
  };

  const updateRate = (field: keyof RateForm, value: string) => {
    setRateForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[760px] sm:max-w-[760px] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 p-7 rounded-xl bg-white border-none shadow-2xl flex flex-col gap-5 overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* ── Header ── */}
          <DialogHeader className="text-left space-y-0 relative pr-10">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                จัดการค่าใช้จ่าย
              </DialogTitle>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-1 -right-1 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* ── Tab Switcher (pill style) ── */}
            <div className="mt-4 flex items-center gap-1 bg-slate-100 rounded-full p-1 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "expenses"
                    ? "bg-white text-[#f26522] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListChecks size={13} />
                รายการค่าใช้จ่าย
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rates")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "rates"
                    ? "bg-white text-[#f26522] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Settings2 size={13} />
                ตั้งค่าอัตราค่าใช้จ่าย
              </button>
            </div>
          </DialogHeader>

          {/* ══════════════════════════════════════
              TAB 1: รายการค่าใช้จ่าย
          ══════════════════════════════════════ */}
          {activeTab === "expenses" && (
            <>
              {/* Search + Add */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อรายการ..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                  />
                </div>
                <Badge className="bg-[#fdf2ec] text-[#f26522] hover:bg-[#fdf2ec] border-none font-extrabold text-xs px-2.5 py-0.5 rounded-lg shadow-sm shrink-0">
                  {filteredExpenses.length} รายการ
                </Badge>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExpense(null);
                    setIsAddOpen(true);
                  }}
                  className="h-9 px-4 rounded-xl bg-[#f26522] hover:bg-[#d8561d] text-white text-xs font-bold transition-all duration-200 shadow-md shadow-[#f26522]/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <Plus size={13} />
                  เพิ่มค่าใช้จ่าย
                </button>
              </div>

              {/* Table */}
              <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold tracking-wider uppercase text-left">
                      <th className="px-6 py-3">ชื่อรายการ / ข้อมูลอ้างอิง</th>
                      <th className="px-6 py-3">ราคาต่อหน่วย</th>
                      <th className="px-6 py-3 text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedExpenses.length > 0 ? (
                      paginatedExpenses.map((exp) => (
                        <tr
                          key={exp.id}
                          className="hover:bg-slate-50/40 transition-colors text-left group"
                        >
                          <td className="px-6 py-3.5">
                            <div className="font-bold text-slate-800 text-sm group-hover:text-[#f26522] transition-colors">
                              {exp.itemName}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                              {exp.subtext}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-extrabold text-slate-800 text-[13px]">
                            ฿{" "}
                            {exp.pricePerUnit.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewExpense(exp)}
                                className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#f26522] hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer hover:shadow-md hover:shadow-[#f26522]/10 hover:scale-105 active:scale-95"
                                title="ดูรายละเอียด / แก้ไข"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer hover:shadow-md hover:shadow-red-500/10 hover:scale-105 active:scale-95"
                                title="ลบรายการ"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-slate-400 font-bold"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <Search size={28} className="text-slate-300 animate-bounce" />
                            <span className="text-xs">
                              ไม่พบข้อมูลค่าใช้จ่ายที่ตรงตามเงื่อนไข
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-left pt-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wide">
                  แสดง{" "}
                  {filteredExpenses.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{" "}
                  ถึง{" "}
                  {Math.min(currentPage * itemsPerPage, filteredExpenses.length)}{" "}
                  จากทั้งหมด {filteredExpenses.length} รายการ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-bold cursor-pointer bg-white hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ChevronLeft size={14} />
                    ก่อนหน้า
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="h-9 px-4 rounded-xl bg-[#f26522] hover:bg-[#d8561d] text-white disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shadow-sm shadow-[#f26522]/10 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ถัดไป
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════
              TAB 2: ตั้งค่าอัตราค่าใช้จ่าย
          ══════════════════════════════════════ */}
          {activeTab === "rates" && (
            <div className="flex flex-col gap-5">

              {/* Capacity Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={11} />
                  เลือกความจุห้อง (Capacity)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCapacityOpen((v) => !v)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-between hover:border-[#f26522]/50 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all cursor-pointer"
                  >
                    <span>{selectedCapacity.label}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${capacityOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {capacityOpen && (
                    <div className="absolute z-50 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      {MOCK_CAPACITIES.map((cap) => (
                        <button
                          key={cap.id}
                          type="button"
                          onClick={() => {
                            setSelectedCapacity(cap);
                            setCapacityOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-left hover:bg-[#fdf2ec] hover:text-[#f26522] transition-colors cursor-pointer ${
                            selectedCapacity.id === cap.id
                              ? "bg-[#fdf2ec] text-[#f26522]"
                              : "text-slate-700"
                          }`}
                        >
                          <span>{cap.label}</span>
                          {selectedCapacity.id === cap.id && (
                            <Check size={14} className="text-[#f26522]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Form */}
              <div className="space-y-5">

                {/* Hourly Rate */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#f26522] rounded-full" />
                    <Clock size={15} className="text-[#f26522]" />
                    <h3 className="text-sm font-black text-slate-800">
                      รายชั่วโมง{" "}
                      <span className="font-semibold text-slate-400">(Hourly Rate)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        บุคลากรภายใน (SUT Internal)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={rateForm.hourlyInternal}
                          onChange={(e) => updateRate("hourlyInternal", e.target.value)}
                          className="w-full h-12 pl-4 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 text-sm font-bold pointer-events-none">฿</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        บุคลากรภายนอก (External)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={rateForm.hourlyExternal}
                          onChange={(e) => updateRate("hourlyExternal", e.target.value)}
                          className="w-full h-12 pl-4 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 text-sm font-bold pointer-events-none">฿</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Daily Rate */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-sky-500 rounded-full" />
                    <CalendarDays size={15} className="text-sky-500" />
                    <h3 className="text-sm font-black text-slate-800">
                      รายวัน{" "}
                      <span className="font-semibold text-slate-400">(Daily Rate)</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        บุคลากรภายใน (SUT Internal)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={rateForm.dailyInternal}
                          onChange={(e) => updateRate("dailyInternal", e.target.value)}
                          className="w-full h-12 pl-4 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 text-sm font-bold pointer-events-none">฿</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        บุคลากรภายนอก (External)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={rateForm.dailyExternal}
                          onChange={(e) => updateRate("dailyExternal", e.target.value)}
                          className="w-full h-12 pl-4 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 text-sm font-bold pointer-events-none">฿</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRateForm(DEFAULT_RATE)}
                  className="h-11 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  รีเซ็ตค่า
                </button>
                <button
                  type="button"
                  onClick={handleRateSave}
                  className={`h-11 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-md ${
                    rateSaved
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-[#f26522] hover:bg-[#d8561d] text-white shadow-[#f26522]/20"
                  }`}
                >
                  {rateSaved ? (
                    <>
                      <Check size={15} />
                      บันทึกแล้ว!
                    </>
                  ) : (
                    "ยืนยันการตั้งค่า"
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddExpenseModal
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedExpense(null);
        }}
        onSave={handleAddExpense}
        initialData={selectedExpense}
        onUpdate={handleUpdateExpense}
      />
    </>
  );
}
