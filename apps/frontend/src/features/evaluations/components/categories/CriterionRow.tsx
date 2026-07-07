"use client"

import { useState, useEffect, useRef } from "react"
import { Pencil, Trash2, X, Check, GripVertical, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
          <div className="space-y-2">
            <Input
              autoFocus
              value={draft.nameTh}
              onChange={(e) => setDraft({ ...draft, nameTh: e.target.value })}
              placeholder="ชื่อเกณฑ์การประเมิน"
              className="h-8 text-sm focus-visible:ring-orange-500/50 bg-slate-100 border-none rounded-[7px]"
            />
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="ระบุหมายเหตุ / คำอธิบายเพิ่มเติม"
              className="h-8 text-xs text-slate-500 focus-visible:ring-orange-500/50 bg-slate-100 border-none rounded-[7px]"
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
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{criterion.nameTh}</p>
          {criterion.description && (
            <p className="text-xs text-slate-500">{criterion.description}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-500">
          5
        </span>
      </td>
      <td className="px-4 py-4 text-right relative">
        <div className="flex items-center justify-end" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-4 top-10 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-100">
              <button
                onClick={() => { setEditing(true); setMenuOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> แก้ไขเกณฑ์
              </button>
              <button
                onClick={() => { onDelete(); setMenuOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 border-t border-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> ลบเกณฑ์
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
