"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, ShoppingBag, Banknote, Shapes, Save, Pencil } from "lucide-react";
import { Expense } from "../../data/expenses";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">) => void;
  initialData?: Expense | null;
  onUpdate?: (updatedExpense: Expense) => void;
}

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  initialData = null,
  onUpdate
}: AddExpenseModalProps) {
  const [itemName, setItemName] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [category, setCategory] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Sync state with initialData when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setItemName(initialData.itemName);
      setPricePerUnit(String(initialData.pricePerUnit));
      setCategory(initialData.category);
      setIsReadOnly(true); // Start in view (read-only) mode
    } else {
      setItemName("");
      setPricePerUnit("");
      setCategory("");
      setIsReadOnly(false); // Start in edit mode for new items
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      // Toggle read-only mode to allow editing
      setIsReadOnly(false);
      return;
    }

    if (!itemName || !pricePerUnit || !category) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price < 0) {
      alert("กรุณากรอกราคาให้ถูกต้อง");
      return;
    }

    if (initialData && onUpdate) {
      // Update existing expense
      onUpdate({
        id: initialData.id,
        itemName,
        pricePerUnit: price,
        category: category.toUpperCase(),
        subtext: initialData.subtext
      });
    } else {
      // Save new expense
      // Generate a random mock asset ID or subtext for display
      const mockAssetIds = ["VCH-2930", "B1101", "Zone A Storage", "Supply Chain", "B1203", "Zone B Lab"];
      const randomSubtext = `Asset ID: ${mockAssetIds[Math.floor(Math.random() * mockAssetIds.length)]}`;

      onSave({
        itemName,
        pricePerUnit: price,
        category: category.toUpperCase(),
        subtext: randomSubtext
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        showCloseButton={false}
        className="w-full max-w-[480px] sm:max-w-[480px] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 p-8 rounded-[24px] bg-white border-none shadow-2xl flex flex-col gap-6"
      >
        {/* Header */}
        <DialogHeader className="text-left space-y-1.5 pr-8 relative">
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              {initialData ? (isReadOnly ? "รายละเอียดรายการ" : "แก้ไขรายการ") : "เพิ่มรายการค่าใช้จ่าย"}
            </DialogTitle>
            {initialData && (
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-widest ${
                isReadOnly ? "bg-slate-100 text-slate-500 border border-slate-200/50" : "bg-[#fdf2ec] text-[#f26522] border border-[#f26522]/10"
              }`}>
                {isReadOnly ? "VIEW" : "EDIT"}
              </span>
            )}
          </div>
          <DialogDescription className="text-xs font-semibold text-slate-400">
            {isReadOnly 
              ? "ดูข้อมูลรายละเอียดของรายการค่าใช้จ่ายที่เลือก"
              : "กรอกข้อมูลรายละเอียดด้านล่างเพื่อบันทึกรายการค่าใช้จ่าย"
            }
          </DialogDescription>
          
          <button 
            type="button"
            onClick={onClose}
            className="absolute -top-1 -right-3 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ชื่อรายการ (Item Name)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
                <ShoppingBag size={18} />
              </span>
              <input
                type="text"
                placeholder="เช่น แม่บ้าน, ค่าไฟฟ้า, ซ่อมแซมเครื่องปรับอากาศ"
                value={itemName}
                disabled={isReadOnly}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100"
              />
            </div>
          </div>

          {/* Price and Category Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Per Unit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ราคาต่อหน่วย (฿)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
                  <Banknote size={18} />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={pricePerUnit}
                  disabled={isReadOnly}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">หมวดหมู่ (Category)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 pointer-events-none">
                  <Shapes size={18} />
                </span>
                <select
                  value={category}
                  disabled={isReadOnly}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 pl-12 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] transition-all duration-200 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="UTILITIES">UTILITIES</option>
                  <option value="CLEANING">CLEANING</option>
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="SUPPLIES">SUPPLIES</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
            >
              {isReadOnly ? "ปิดหน้าต่าง" : "ยกเลิก"}
            </button>
            <button
              type="submit"
              className="h-12 bg-[#f26522] hover:bg-[#d8561d] text-white rounded-xl font-bold transition-all duration-200 shadow-md shadow-[#f26522]/10 hover:shadow-lg hover:shadow-[#f26522]/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isReadOnly ? (
                <>
                  <Pencil size={15} />
                  แก้ไขข้อมูล
                </>
              ) : (
                <>
                  <Save size={15} />
                  บันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
