"use client"

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
  HelpCircle
} from "lucide-react";
import { mockExpenses as initialExpenses, Expense } from "../../data/expenses";
import AddExpenseModal from "./AddExpenseModal";
import { Badge } from "@/components/ui/badge";

const categoryStyles: Record<string, { icon: React.ReactNode, bg: string, text: string, border: string, dot: string }> = {
  MAINTENANCE: {
    icon: <Wrench size={11} />,
    bg: "bg-amber-50/80",
    text: "text-amber-700",
    border: "border-amber-100/70",
    dot: "bg-amber-500"
  },
  UTILITIES: {
    icon: <Zap size={11} />,
    bg: "bg-blue-50/80",
    text: "text-blue-700",
    border: "border-blue-100/70",
    dot: "bg-blue-500"
  },
  OPERATIONAL: {
    icon: <Sparkle size={11} />,
    bg: "bg-violet-50/80",
    text: "text-violet-700",
    border: "border-violet-100/70",
    dot: "bg-violet-500"
  },
  SECURITY: {
    icon: <Shield size={11} />,
    bg: "bg-rose-50/80",
    text: "text-rose-700",
    border: "border-rose-100/70",
    dot: "bg-rose-500"
  },
  SUPPLIES: {
    icon: <Package size={11} />,
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    border: "border-emerald-100/70",
    dot: "bg-emerald-500"
  }
};

const getCategoryStyle = (category: string) => {
  const upperCat = category.toUpperCase();
  return categoryStyles[upperCat] || {
    icon: <HelpCircle size={11} />,
    bg: "bg-slate-50/80",
    text: "text-slate-700",
    border: "border-slate-100/70",
    dot: "bg-slate-500"
  };
};

interface ManageExpensesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageExpensesModal({
  open,
  onClose
}: ManageExpensesModalProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Search & Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = exp.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            exp.subtext.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return ["ALL", ...Array.from(cats)];
  }, [expenses]);

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

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const id = `EXP-${String(expenses.length + 1).padStart(3, "0")}`;
    setExpenses((prev) => [
      {
        id,
        ...newExpense
      },
      ...prev
    ]);
    // Reset filters to see the new item
    setSearchQuery("");
    setSelectedCategory("ALL");
    setCurrentPage(1);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
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
          className="w-full max-w-[760px] sm:max-w-[760px] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 p-7 rounded-[24px] bg-white border-none shadow-2xl flex flex-col gap-5 overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="text-left space-y-0 relative pr-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  รายการค่าใช้จ่าย
                  <Badge className="bg-[#fdf2ec] text-[#f26522] hover:bg-[#fdf2ec] border-none font-extrabold text-xs px-2.5 py-0.5 rounded-lg shadow-sm">
                    {filteredExpenses.length}
                  </Badge>
                </DialogTitle>
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
                  Track and manage expenditures for rooms and assets.
                </p>
              </div>
              
              {/* Actions group */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-9 px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                    showFilters 
                      ? "bg-[#fdf3ec] border-[#f26522] text-[#f26522] shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <Filter size={13} />
                  FILTER
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExpense(null);
                    setIsAddOpen(true);
                  }}
                  className="h-9 px-4 rounded-xl bg-[#f26522] hover:bg-[#d8561d] text-white text-xs font-bold transition-all duration-200 shadow-md shadow-[#f26522]/20 cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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

          {/* Interactive Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ค้นหา (Search)</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อรายการ หรือ Asset ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">หมวดหมู่ (Category)</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] cursor-pointer transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "ALL" ? "ทั้งหมด (ALL)" : cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold tracking-wider uppercase text-left">
                  <th className="px-6 py-3">ชื่อรายการ / ข้อมูลอ้างอิง</th>
                  <th className="px-6 py-3">หมวดหมู่</th>
                  <th className="px-6 py-3">ราคาต่อหน่วย</th>
                  <th className="px-6 py-3 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors text-left group">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-[#f26522] transition-colors">{exp.itemName}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{exp.subtext}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        {(() => {
                          const style = getCategoryStyle(exp.category);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-extrabold tracking-widest ${style.bg} ${style.text} ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {style.icon}
                              {exp.category}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-3.5 font-extrabold text-slate-800 text-[13px]">
                        ฿ {exp.pricePerUnit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewExpense(exp)}
                          className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#f26522] hover:text-white transition-all duration-200 flex items-center justify-center mx-auto cursor-pointer hover:shadow-md hover:shadow-[#f26522]/10 hover:scale-105 active:scale-95"
                          title="ดูรายละเอียด / แก้ไข"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <Search size={28} className="text-slate-300 animate-bounce" />
                        <span className="text-xs">ไม่พบข้อมูลค่าใช้จ่ายที่ตรงตามเงื่อนไข</span>
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
              แสดง {filteredExpenses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} ถึง{" "}
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} จากทั้งหมด {filteredExpenses.length} รายการ
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
