"use client"

import { FolderOpen, Plus, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AssessmentCategory, AssessmentPermission } from "../../types/assessmentSet"
import { CriterionItem } from "./CriterionItem"
import { PermissionCheckboxes } from "./PermissionCheckboxes"

// ── Component ──────────────────────────────────────────────────────────
interface CategorySectionProps {
  category: AssessmentCategory
  onDeleteCriterion: (id: string) => void
  onUpdatePermissions: (permissions: AssessmentPermission[]) => void
  onRemoveCategory: () => void
}

export function CategorySection({
  category,
  onDeleteCriterion,
  onUpdatePermissions,
  onRemoveCategory,
}: CategorySectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-700">
            หมวดหมู่:{" "}
            <span className="font-bold text-slate-900">{category.nameTh}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
              <DropdownMenuItem 
                onClick={onRemoveCategory}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>เอาหมวดหมู่ออก</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Permission checkboxes — per category */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-white">
        <PermissionCheckboxes
          permissions={category.permissions}
          onChange={onUpdatePermissions}
        />
      </div>

      {/* Criteria list */}
      <div className="flex flex-col bg-white">
        {category.criteria.map((c) => (
          <CriterionItem
            key={c.id}
            criterion={c}
            onEdit={() => {}}
            onDelete={() => onDeleteCriterion(c.id)}
          />
        ))}
        {category.criteria.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2 pl-1">
            ยังไม่มีเกณฑ์การประเมินในหมวดหมู่นี้
          </p>
        )}
      </div>
    </div>
  )
}
