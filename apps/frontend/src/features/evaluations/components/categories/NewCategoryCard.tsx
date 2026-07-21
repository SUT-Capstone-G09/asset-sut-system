"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Category } from "../../types/category"

export function NewCategoryCard({
  onSave,
  onCancel,
}: {
  onSave: (cat: Category) => void
  onCancel: () => void
}) {
  const [nameTh, setNameTh] = useState("")

  const submit = () => {
    if (!nameTh.trim()) return
    onSave({ id: `cat-${Date.now()}`, nameTh, criteria: [] })
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
          <Button size="sm" onClick={submit}>
            <Check className="w-3.5 h-3.5 mr-1" />บันทึก
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
