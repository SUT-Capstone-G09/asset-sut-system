"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  Plus,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Wrench,
  Zap,
  Shield,
  Package,
  Sparkle,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { addonService, Addon as Expense } from "@/lib/services/addon.service";
import AddExpenseModal from "./AddExpenseModal";
import { Badge } from "@/components/ui/badge";

// Removed category styles

interface ManageExpensesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageExpensesModal({
  open,
  onClose,
}: ManageExpensesModalProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      return exp.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [expenses, searchQuery]);

  // Paginated Expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;

  // Sync page if out of bounds after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredExpenses, currentPage, totalPages]);

  const handleAddExpense = async (newExpense: Omit<Expense, "id">) => {
    try {
      const created = await addonService.create(newExpense);
      setExpenses((prev) => [created, ...prev]);
      // Reset filters to see the new item
      setSearchQuery("");
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเพิ่มค่าใช้จ่ายได้");
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    try {
      const updated = await addonService.update(
        updatedExpense.id,
        updatedExpense,
      );
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === updated.id ? updated : exp)),
      );
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถแก้ไขค่าใช้จ่ายได้");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      return;
    }

    try {
      await addonService.delete(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));

      // If the current page becomes empty after deletion, go back one page
      const newFilteredLength = filteredExpenses.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบค่าใช้จ่ายได้");
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsAddOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[760px] sm:max-w-[760px] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 p-7 rounded-xl bg-white border-none shadow-2xl flex flex-col gap-5 overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="text-left space-y-0 relative pr-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  รายการค่าใช้จ่าย
                  <Badge className="bg-[#fdf2ec] text-[#f26522] hover:bg-[#fdf2ec] border-none font-extrabold tex-xs px-2.5 py-0.5 rounded-lg shadow-sm">
                    {filteredExpenses.length}
                  </Badge>
                </DialogTitle>
              </div>

              {/* Actions group */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
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
                    className="w-full sm:w-64 h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                  />
                </div>

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
            </div>

            {/* Custom Close Button to prevent overlap */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-1 -right-1 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </DialogHeader>



          {/* Table Container */}
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
                        <Search
                          size={28}
                          className="text-slate-300 animate-bounce"
                        />
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="h-9 px-4 rounded-xl bg-[#f26522] hover:bg-[#d8561d] text-white disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shadow-sm shadow-[#f26522]/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                ถัดไป
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
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
