"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Trash2, X, Check, GripVertical, FileText, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Criterion } from "../../types/category"

export function CriterionRow({
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: criterion.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: 'relative' as const, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {})
  }

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
      <div className="flex items-start gap-4 p-4 bg-slate-50 border-b border-slate-100 last:border-0 relative">
        <div className="pt-2">
          <GripVertical className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex-1 space-y-3">
          <Input
            autoFocus
            value={draft.nameTh}
            onChange={(e) => setDraft({ ...draft, nameTh: e.target.value })}
            placeholder="ชื่อเกณฑ์การประเมิน"
            className="h-9 text-sm focus-visible:ring-orange-500/50 bg-white border-slate-200 rounded-[7px] w-full max-w-md"
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="ระบุหมายเหตุ / คำอธิบายเพิ่มเติม"
            className="h-8 text-xs text-slate-500 focus-visible:ring-orange-500/50 bg-white border-slate-200 rounded-[7px] w-full"
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button size="icon" onClick={save} className="h-9 w-9">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={cancel} className="h-9 w-9">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-start gap-4 p-4 bg-white border-b border-slate-100 last:border-0 group transition-colors duration-200 ${isDragging ? 'bg-slate-50 opacity-90' : 'hover:bg-slate-50/80'}`}
    >
      <div className="pt-1" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-slate-200 hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing" />
      </div>
      
      <div className="flex-1 space-y-1">
        <p className="text-[15px] font-bold text-slate-800 leading-snug">{criterion.nameTh}</p>
        {criterion.description && (
          <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
            <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="leading-relaxed">{criterion.description}</span>
          </p>
        )}
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
            <DropdownMenuItem 
              onClick={() => setEditing(true)}
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
