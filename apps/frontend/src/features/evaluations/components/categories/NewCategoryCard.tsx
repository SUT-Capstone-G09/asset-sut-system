"use client"

import { useState } from "react"
import { Check, X, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Category } from "../../types/category"

export const OPERATOR_TYPES = [
  { id: "food",    label: "ร้านอาหาร",   color: "bg-orange-100 text-orange-700 border-orange-200"  },
  { id: "drink",   label: "เครื่องดื่ม", color: "bg-blue-100   text-blue-700   border-blue-200"    },
  { id: "snack",   label: "ของว่าง",     color: "bg-amber-100  text-amber-700  border-amber-200"   },
  { id: "general", label: "ทั่วไป",      color: "bg-slate-100  text-slate-600  border-slate-200"   },
]

export function getType(id: string) {
  return OPERATOR_TYPES.find((t) => t.id === id)
}

function OperatorTypeSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPERATOR_TYPES.map((t) => {
        const isSelected = selected.includes(t.id)
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-150
              ${isSelected
                ? `${t.color} border-current shadow-sm scale-105`
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
              }`}
          >
            {isSelected && <Check className="w-3 h-3" />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export function NewCategoryCard({
  onSave,
  onCancel,
}: {
  onSave: (cat: Category & { operatorTypes?: string[] }) => void
  onCancel: () => void
}) {
  const [nameTh, setNameTh] = useState("")
  const [operatorTypes, setOperatorTypes] = useState<string[]>([])

  const submit = () => {
    if (!nameTh.trim()) return
    onSave({ id: `cat-${Date.now()}`, nameTh, operatorTypes, criteria: [] })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex gap-2 flex-1 max-w-sm">
          <Input
            autoFocus
            value={nameTh}
            onChange={(e) => setNameTh(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit() }}
            placeholder="ชื่อหมวดหมู่"
            className="h-9 text-sm focus-visible:ring-orange-500/50 bg-slate-100 border-none rounded-[7px]"
          />
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Button size="sm" className="bg-[#f26522] hover:bg-orange-600 text-white h-8" onClick={submit}>
            <Check className="w-3.5 h-3.5 mr-1" />บันทึก
          </Button>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-6 py-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5" />
          แสดงสำหรับประเภทผู้ประกอบการ
          <span className="font-normal text-slate-400">(เลือกได้หลายประเภท)</span>
        </p>
        <OperatorTypeSelector selected={operatorTypes} onChange={setOperatorTypes} />
        {operatorTypes.length === 0 && (
          <p className="text-xs text-slate-400 italic">ยังไม่ได้เลือกประเภท — หมวดหมู่จะไม่แสดงในการประเมิน</p>
        )}
      </div>
    </div>
  )
}
