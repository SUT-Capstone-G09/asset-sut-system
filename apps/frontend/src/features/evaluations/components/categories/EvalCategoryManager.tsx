"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Category } from "../../types/category"
import { CategoryCard } from "./CategoryCard"
import { NewCategoryCard } from "./NewCategoryCard"
import { Button } from "@/components/ui/button"

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    nameTh: "เกณฑ์ด้านสุขอนามัย",
    criteria: [
      { id: "c1", nameTh: "ความสะอาดของสถานที่", description: "การรักษาความสะอาดและสภาพพื้นที่", maxScore: 5 },
      { id: "c2", nameTh: "การแต่งกายของพนักงาน", description: "ความเป็นระเบียบเรียบร้อยและสะอาดของพนักงาน", maxScore: 5 },
    ],
  },
  {
    id: "cat-2",
    nameTh: "คุณภาพการบริการ",
    criteria: [
      { id: "c3", nameTh: "ความรวดเร็วในการให้บริการ", description: "เวลาที่ใช้ในการตอบสนองต่อลูกค้า", maxScore: 5 },
      { id: "c4", nameTh: "ความสุภาพและอัธยาศัย", description: "กิริยาท่าทางและมนุษยสัมพันธ์กับผู้มาใช้บริการ", maxScore: 5 },
    ],
  },
  {
    id: "cat-3",
    nameTh: "มาตรฐานการชำระเงิน",
    criteria: [
      { id: "c5", nameTh: "ความตรงต่อเวลาในการชำระค่าธรรมเนียม", description: "ประวัติการชำระเงินตามกำหนด", maxScore: 5 },
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
    <div className="space-y-6 mt-4">
      <div className="flex justify-end">
        {!addingNew && (
          <Button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2.5"
          >
            <Plus className="w-4 h-4" />
            สร้างหมวดหมู่ใหม่
          </Button>
        )}
      </div>

      {addingNew && (
        <NewCategoryCard
          onSave={addCategory}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onUpdate={(updated) => updateCategory(cat.id, updated)}
          onDelete={() => deleteCategory(cat.id)}
        />
      ))}
    </div>
  )
}
