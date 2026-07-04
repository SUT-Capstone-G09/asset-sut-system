"use client"
import { useState } from "react"
import { Pencil, Trash2, Plus, X, Check, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Criterion = {
  id: string
  nameTh: string
  description: string
}

type Category = {
  id: string
  nameTh: string
  criteria: Criterion[]
}

// ─── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    nameTh: "เกณฑ์ด้านสุขอนามัย",
    criteria: [
      { id: "c1", nameTh: "ความสะอาดของสถานที่", description: "การรักษาความสะอาดและสภาพพื้นที่" },
      { id: "c2", nameTh: "การแต่งกายของพนักงาน", description: "ความเป็นระเบียบเรียบร้อยและสะอาดของพนักงาน" },
    ],
  },
  {
    id: "cat-2",
    nameTh: "คุณภาพการบริการ",
    criteria: [
      { id: "c3", nameTh: "ความรวดเร็วในการให้บริการ", description: "เวลาที่ใช้ในการตอบสนองต่อลูกค้า" },
      { id: "c4", nameTh: "ความสุภาพและอัธยาศัย", description: "กิริยาท่าทางและมนุษยสัมพันธ์กับผู้มาใช้บริการ" },
    ],
  },
  {
    id: "cat-3",
    nameTh: "มาตรฐานการชำระเงิน",
    criteria: [
      { id: "c5", nameTh: "ความตรงต่อเวลาในการชำระค่าธรรมเนียม", description: "ประวัติการชำระเงินตามกำหนด" },
    ],
  },
]

// ─── Inline Criterion Row ──────────────────────────────────────────────────────

function CriterionRow({
  criterion,
  onUpdate,
  onDelete,
}: {
  criterion: Criterion
  onUpdate: (updated: Criterion) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(criterion.nameTh === "")
  const [draft, setDraft] = useState(criterion)

  const save = () => {
    onUpdate(draft)
    setEditing(false)
  }

  const cancel = () => {
    if (criterion.nameTh === "") {
      onDelete()
    } else {
      setDraft(criterion)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <tr className="bg-white border-b border-slate-100">
        <td className="px-4 py-3 w-8">
          <GripVertical className="w-4 h-4 text-slate-300" />
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1.5">
            <Input
              autoFocus
              value={draft.nameTh}
              onChange={(e) => setDraft({ ...draft, nameTh: e.target.value })}
              placeholder="ชื่อเกณฑ์การประเมิน"
              className="h-8 text-sm"
            />
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="คำอธิบาย (ถ้ามี)"
              className="h-8 text-xs text-slate-500"
            />
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-400 bg-slate-50">
            5
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={save} className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={cancel} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 group transition-colors">
      <td className="px-4 py-4 w-8">
        <GripVertical className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab" />
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-slate-800">{criterion.nameTh}</p>
        {criterion.description && (
          <p className="text-xs text-slate-400 mt-0.5">{criterion.description}</p>
        )}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-500">
          5
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
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
      </td>
    </tr>
  )
}

// ─── New Category Inline Card ─────────────────────────────────────────────────

function NewCategoryCard({
  onSave,
  onCancel,
}: {
  onSave: (cat: Category) => void
  onCancel: () => void
}) {
  const [nameTh, setNameTh] = useState("")

  const submit = () => {
    if (!nameTh.trim()) return
    onSave({
      id: `cat-${Date.now()}`,
      nameTh,
      criteria: [],
    })
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
            className="h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Button
            size="sm"
            className="bg-[#f26522] hover:bg-orange-600 text-white h-8"
            onClick={submit}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            บันทึก
          </Button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-6 py-4 text-sm text-slate-400 italic">
        บันทึกหมวดหมู่ก่อน จากนั้นจะสามารถเพิ่มเกณฑ์ได้
      </div>
    </div>
  )
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category
  onUpdate: (updated: Category) => void
  onDelete: () => void
}) {
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState(category.nameTh)

  const saveHeader = () => {
    onUpdate({ ...category, nameTh: headerDraft })
    setEditingHeader(false)
  }

  const addCriterion = () => {
    const newCrit: Criterion = {
      id: `crit-${Date.now()}`,
      nameTh: "",
      description: "",
    }
    onUpdate({ ...category, criteria: [...category.criteria, newCrit] })
  }

  const updateCriterion = (id: string, updated: Criterion) => {
    onUpdate({ ...category, criteria: category.criteria.map((c) => (c.id === id ? updated : c)) })
  }

  const deleteCriterion = (id: string) => {
    onUpdate({ ...category, criteria: category.criteria.filter((c) => c.id !== id) })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        {editingHeader ? (
          <div className="flex items-center gap-3 flex-1">
            <Input
              autoFocus
              value={headerDraft}
              onChange={(e) => setHeaderDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveHeader() }}
              placeholder="ชื่อหมวดหมู่"
              className="h-8 text-sm font-bold max-w-sm"
            />
            <div className="flex gap-1">
              <button onClick={saveHeader} className="p-1.5 rounded hover:bg-green-100 text-green-600">
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setHeaderDraft(category.nameTh); setEditingHeader(false) }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-slate-900">{category.nameTh}</h3>
            <div className="flex items-center gap-1">
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
          </>
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
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
              การจัดการ
            </th>
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
          + เพิ่มเกณฑ์ (Add Criterion)
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function EvalCategoryManager() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [addingNew, setAddingNew] = useState(false)

  const updateCategory = (id: string, updated: Category) => {
    setCategories(categories.map((c) => (c.id === id ? updated : c)))
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  const addCategory = (cat: Category) => {
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
          + เพิ่มหมวดหมู่ใหม่ (Add New Category)
        </button>
      )}
    </div>
  )
}
