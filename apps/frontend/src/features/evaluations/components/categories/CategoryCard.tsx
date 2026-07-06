"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, X, Check, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Category, Criterion } from "../../types/category"
import { CriterionRow } from "./CriterionRow"
import { getType, OPERATOR_TYPES } from "./NewCategoryCard"

function OperatorChip({ id }: { id: string }) {
  const t = getType(id)
  if (!t) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${t.color}`}>
      {t.label}
    </span>
  )
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

export function CategoryCard({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category & { operatorTypes?: string[] }
  onUpdate: (updated: any) => void
  onDelete: () => void
}) {
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState(category.nameTh)
  const [typesDraft, setTypesDraft] = useState<string[]>(category.operatorTypes || [])

  const saveHeader = () => {
    onUpdate({ ...category, nameTh: headerDraft, operatorTypes: typesDraft })
    setEditingHeader(false)
  }

  const cancelHeader = () => {
    setHeaderDraft(category.nameTh)
    setTypesDraft(category.operatorTypes || [])
    setEditingHeader(false)
  }

  const addCriterion = () => {
    const newCrit: Criterion = { id: `crit-${Date.now()}`, nameTh: "", description: "" }
    onUpdate({ ...category, criteria: [...category.criteria, newCrit] })
  }

  const updateCriterion = (id: string, updated: Criterion) =>
    onUpdate({ ...category, criteria: category.criteria.map((c) => (c.id === id ? updated : c)) })

  const deleteCriterion = (id: string) =>
    onUpdate({ ...category, criteria: category.criteria.filter((c) => c.id !== id) })

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Category Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        {editingHeader ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                autoFocus
                value={headerDraft}
                onChange={(e) => setHeaderDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveHeader() }}
                placeholder="ชื่อหมวดหมู่"
                className="h-8 text-sm font-bold max-w-sm focus-visible:ring-orange-500/50 bg-slate-100 border-none rounded-[7px]"
              />
              <div className="flex gap-1">
                <button onClick={saveHeader} className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={cancelHeader} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                แสดงสำหรับประเภทผู้ประกอบการ
                <span className="font-normal text-slate-400">(เลือกได้หลายประเภท)</span>
              </p>
              <OperatorTypeSelector selected={typesDraft} onChange={setTypesDraft} />
              {typesDraft.length === 0 && (
                <p className="text-xs text-slate-400 italic">ยังไม่ได้เลือกประเภท — หมวดหมู่จะไม่แสดงในการประเมิน</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">{category.nameTh}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Store className="w-3 h-3" /> ประเภท:
                </span>
                {category.operatorTypes && category.operatorTypes.length > 0
                  ? category.operatorTypes.map((id) => <OperatorChip key={id} id={id} />)
                  : <span className="text-xs text-slate-400 italic">ไม่ได้กำหนด</span>
                }
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditingHeader(true)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Criteria Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="w-8 px-4 py-2.5" />
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ชื่อเกณฑ์การประเมิน
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">
              คะแนนสูงสุด
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-24" />
          </tr>
        </thead>
        <tbody>
          {category.criteria.map((crit) => (
            <CriterionRow
              key={crit.id}
              criterion={crit}
              onUpdate={(updated) => updateCriterion(crit.id, updated)}
              onDelete={() => deleteCriterion(crit.id)}
            />
          ))}
        </tbody>
      </table>

      {/* Add Criterion Button */}
      <div className="px-4 py-3 border-t border-slate-100">
        <button
          type="button"
          onClick={addCriterion}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-sm font-medium text-slate-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50/40 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          เพิ่มเกณฑ์
        </button>
      </div>
    </div>
  )
}
