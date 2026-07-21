"use client"

import { useState } from "react"
import {
  ChevronUp,
  ChevronDown,
  FolderPlus,
  ClipboardList,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { AssessmentSet, AssessmentCategory, AssessmentCriterion, AssessmentPermission } from "../../types/assessmentSet"
import { CategorySection } from "./CategorySection"
import { DEFAULT_CATEGORIES } from "../categories/EvalCategoryManager"

// ── Mock Data ──────────────────────────────────────────────────────────
const MOCK_SETS: AssessmentSet[] = [
  {
    id: "set-1",
    name: "ประเมินร้านค้า",
    lastUpdated: "12 OCT 2023",
    categories: [
      {
        id: "cat-1",
        nameTh: "Facility Hygiene",
        permissions: ["admin", "staff"],
        criteria: [
          {
            id: "c1",
            code: "#CRIT-102",
            nameTh: "ความสะอาดของพื้นผิวสัมผัสและจุดสาธารณะภายในอาคาร",
            tags: ["MANDATORY", "PHOTO REQUIRED"],
          },
          {
            id: "c2",
            code: "#CRIT-105",
            nameTh: "ระบบระบายอากาศทำงานปกติและไม่มีกลิ่นไม่พึงประสงค์",
            tags: ["TECHNICAL"],
          },
        ],
      },
      {
        id: "cat-2",
        nameTh: "Staff Safety",
        permissions: ["admin"],
        criteria: [
          {
            id: "c3",
            code: "#CRIT-201",
            nameTh: "พนักงานสวมชุดอุปกรณ์ป้องกันส่วนบุคคล (PPE) ครบถ้วน",
            tags: ["MANDATORY"],
          },
        ],
      },
    ],
  },
  {
    id: "set-2",
    name: "Service Quality (SQ-Core)",
    lastUpdated: "05 NOV 2023",
    categories: [
      {
        id: "cat-3",
        nameTh: "Customer Service",
        permissions: ["admin", "staff", "external"],
        criteria: [
          { id: "c4", code: "#CRIT-301", nameTh: "ความรวดเร็วในการให้บริการ", tags: ["MANDATORY"] },
          { id: "c5", code: "#CRIT-302", nameTh: "ความสุภาพและมนุษยสัมพันธ์", tags: ["OPTIONAL"] },
        ],
      },
      {
        id: "cat-4",
        nameTh: "Product Quality",
        permissions: ["admin", "staff"],
        criteria: [
          { id: "c6", code: "#CRIT-401", nameTh: "คุณภาพของสินค้าและผลิตภัณฑ์", tags: ["MANDATORY"] },
        ],
      },
      {
        id: "cat-5",
        nameTh: "Pricing Compliance",
        permissions: ["admin"],
        criteria: [
          { id: "c7", code: "#CRIT-501", nameTh: "ราคาสินค้าเป็นไปตามที่ตกลงและติดป้ายชัดเจน", tags: ["MANDATORY"] },
        ],
      },
    ],
  },
]

// ── AssessmentSetCard ──────────────────────────────────────────────────────────
interface AssessmentSetCardProps {
  set: AssessmentSet
  defaultExpanded?: boolean
  onUpdate: (updated: AssessmentSet) => void
  onDelete: () => void
}

function AssessmentSetCard({ set, defaultExpanded = false, onUpdate, onDelete }: AssessmentSetCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const totalCategories = set.categories.length
  const totalCriteria = set.categories.reduce((sum, cat) => sum + cat.criteria.length, 0)

  const addCategory = (sourceCatId: string) => {
    const sourceCat = DEFAULT_CATEGORIES.find(c => c.id === sourceCatId)
    if (!sourceCat) return

    const newCat: AssessmentCategory = {
      id: `cat-${Date.now()}`,
      nameTh: sourceCat.nameTh,
      permissions: [],
      criteria: sourceCat.criteria.map((c, i) => ({
        id: `c-${Date.now()}-${i}`,
        code: `#CRIT-${Math.floor(100 + Math.random() * 900)}`,
        nameTh: c.nameTh,
        tags: ["MANDATORY"],
        maxScore: c.maxScore || 5,
      })),
    }
    onUpdate({ ...set, categories: [...set.categories, newCat] })
  }

  const removeCategory = (catId: string) => {
    onUpdate({ ...set, categories: set.categories.filter((c) => c.id !== catId) })
  }


  const deleteCriterion = (catId: string, critId: string) => {
    onUpdate({
      ...set,
      categories: set.categories.map((cat) =>
        cat.id === catId
          ? { ...cat, criteria: cat.criteria.filter((c) => c.id !== critId) }
          : cat
      ),
    })
  }

  const updateCategoryPermissions = (catId: string, permissions: AssessmentPermission[]) => {
    onUpdate({
      ...set,
      categories: set.categories.map((cat) =>
        cat.id === catId ? { ...cat, permissions } : cat
      ),
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Card header */}
      <div 
        className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${expanded ? 'bg-slate-50' : 'bg-white'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 shrink-0">
            <ClipboardList className="w-6 h-6 text-orange-500" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-[17px] font-bold text-slate-900 truncate">{set.name}</h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>{totalCategories} หมวดหมู่</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{totalCriteria} เกณฑ์ประเมิน</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Last Updated: {set.lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
              <DropdownMenuItem 
                onClick={() => {}}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <Pencil className="w-4 h-4 text-slate-500" />
                <span>แก้ไขชุดแบบประเมิน</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>ลบชุดแบบประเมิน</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="h-9 w-9 ml-1 text-slate-400 hover:text-slate-700"
              title={expanded ? "ย่อเก็บ" : "ขยายดูรายละเอียด"}
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-slate-100 px-6 py-6 space-y-5 bg-slate-50/30">
          {set.categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              onDeleteCriterion={(critId) => deleteCriterion(cat.id, critId)}
              onUpdatePermissions={(perms) => updateCategoryPermissions(cat.id, perms)}
              onRemoveCategory={() => removeCategory(cat.id)}
            />
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 border-orange-200/60 bg-orange-50/50 text-orange-600 hover:bg-orange-100/80 hover:text-orange-700 font-bold border-dashed"
              >
                <FolderPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>ดึงหมวดหมู่จากเกณฑ์มาตรฐาน</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[400px] max-w-[90vw] bg-white border border-slate-150 shadow-lg rounded-xl p-2 z-50">
              <div className="px-3 py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1.5 flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5" />
                เลือกหมวดหมู่ที่ต้องการ
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => addCategory(cat.id)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 mb-1 last:mb-0 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-orange-100/50 flex items-center justify-center shrink-0">
                        <FolderPlus className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="truncate">{cat.nameTh}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {cat.criteria.length} เกณฑ์
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

// ── AssessmentSetManager (main export) ──────────────────────────────────────────
interface AssessmentSetManagerProps {
  onAddNew?: () => void
}

export function AssessmentSetManager({ onAddNew }: AssessmentSetManagerProps) {
  const [sets, setSets] = useState<AssessmentSet[]>(MOCK_SETS)

  const updateSet = (id: string, updated: AssessmentSet) =>
    setSets(sets.map((s) => (s.id === id ? updated : s)))

  const deleteSet = (id: string) => setSets(sets.filter((s) => s.id !== id))

  return (
    <div className="space-y-4">
      {sets.map((set, idx) => (
        <AssessmentSetCard
          key={set.id}
          set={set}
          defaultExpanded={idx === 0}
          onUpdate={(updated) => updateSet(set.id, updated)}
          onDelete={() => deleteSet(set.id)}
        />
      ))}

      {sets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <ClipboardList className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">ยังไม่มีชุดการประเมิน</p>
          <p className="text-xs">กด &quot;สร้างชุดคำถามใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      )}
    </div>
  )
}
