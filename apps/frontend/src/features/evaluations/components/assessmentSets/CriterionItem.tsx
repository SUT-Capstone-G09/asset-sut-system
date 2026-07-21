"use client"

import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AssessmentCriterion, CriterionTag } from "../../types/assessmentSet"

// ── Component ──────────────────────────────────────────────────────────
interface CriterionItemProps {
  criterion: AssessmentCriterion
  onEdit: () => void
  onDelete: () => void
}

export function CriterionItem({ criterion, onEdit, onDelete }: CriterionItemProps) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 bg-white border-b border-slate-100 last:border-none hover:bg-slate-50 transition-all duration-150 group">
      {/* Code badge */}
      <span className="shrink-0 text-[11px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 leading-none mt-0.5 whitespace-nowrap">
        {criterion.code}
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0 flex items-center">
        <p className="text-sm text-slate-800 font-medium leading-snug">{criterion.nameTh}</p>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
            <DropdownMenuItem 
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
              <span>แก้ไขเกณฑ์</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>ลบเกณฑ์</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
