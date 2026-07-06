"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Category } from "../../types/category"
import { CategoryCard } from "./CategoryCard"
import { NewCategoryCard } from "./NewCategoryCard"

const DEFAULT_CATEGORIES: (Category & { operatorTypes: string[] })[] = [
  {
    id: "cat-1",
    nameTh: "เกณฑ์ด้านสุขอนามัย",
    operatorTypes: ["food", "drink"],
    criteria: [
      { id: "c1", nameTh: "ความสะอาดของสถานที่", description: "การรักษาความสะอาดและสภาพพื้นที่" },
      { id: "c2", nameTh: "การแต่งกายของพนักงาน", description: "ความเป็นระเบียบเรียบร้อยและสะอาดของพนักงาน" },
    ],
  },
  {
    id: "cat-2",
    nameTh: "คุณภาพการบริการ",
    operatorTypes: ["food", "snack", "general"],
    criteria: [
      { id: "c3", nameTh: "ความรวดเร็วในการให้บริการ", description: "เวลาที่ใช้ในการตอบสนองต่อลูกค้า" },
      { id: "c4", nameTh: "ความสุภาพและอัธยาศัย", description: "กิริยาท่าทางและมนุษยสัมพันธ์กับผู้มาใช้บริการ" },
    ],
  },
  {
    id: "cat-3",
    nameTh: "มาตรฐานการชำระเงิน",
    operatorTypes: ["general"],
    criteria: [
      { id: "c5", nameTh: "ความตรงต่อเวลาในการชำระค่าธรรมเนียม", description: "ประวัติการชำระเงินตามกำหนด" },
    ],
  },
]

export function EvalCategoryManager() {
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES)
  const [addingNew, setAddingNew] = useState(false)

  const updateCategory = (id: string, updated: any) =>
    setCategories(categories.map((c) => (c.id === id ? updated : c)))

  const deleteCategory = (id: string) =>
    setCategories(categories.filter((c) => c.id !== id))

  const addCategory = (cat: any) => {
    setCategories([...categories, cat])
    setAddingNew(false)
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onUpdate={(updated) => updateCategory(cat.id, updated)}
          onDelete={() => deleteCategory(cat.id)}
        />
      ))}

      {addingNew && (
        <NewCategoryCard
          onSave={addCategory}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {!addingNew && (
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50/40 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      )}
    </div>
  )
}
