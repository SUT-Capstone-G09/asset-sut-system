"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, X, Check, ChevronDown, ChevronUp, FolderOpen, MoreHorizontal } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Category, Criterion } from "../../types/category"
import { CriterionRow } from "./CriterionRow"
import { cn } from "@/lib/utils"

export function CategoryCard({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category
  onUpdate: (updated: any) => void
  onDelete: () => void
}) {
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerDraft, setHeaderDraft] = useState(category.nameTh)
  const [isExpanded, setIsExpanded] = useState(true)

  const saveHeader = () => {
    onUpdate({ ...category, nameTh: headerDraft })
    setEditingHeader(false)
  }

  const cancelHeader = () => {
    setHeaderDraft(category.nameTh)
    setEditingHeader(false)
  }

  const addCriterion = () => {
    const newCrit: Criterion = { id: `crit-${Date.now()}`, nameTh: "", description: "", maxScore: 5 }
    onUpdate({ ...category, criteria: [...category.criteria, newCrit] })
    if (!isExpanded) setIsExpanded(true)
  }

  const updateCriterion = (id: string, updated: Criterion) =>
    onUpdate({ ...category, criteria: category.criteria.map((c) => (c.id === id ? updated : c)) })

  const deleteCriterion = (id: string) =>
    onUpdate({ ...category, criteria: category.criteria.filter((c) => c.id !== id) })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = category.criteria.findIndex((c) => c.id === active.id)
      const newIndex = category.criteria.findIndex((c) => c.id === over.id)
      onUpdate({ ...category, criteria: arrayMove(category.criteria, oldIndex, newIndex) })
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
      {/* Category Header */}
      <div 
        className={cn(
          "px-6 py-4 flex items-center justify-between gap-4 transition-colors",
          isExpanded ? "bg-white border-b border-slate-100" : "bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
        )}
        onClick={() => !editingHeader && setIsExpanded(!isExpanded)}
      >
        {editingHeader ? (
          <div className="flex items-center gap-3 flex-1" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-orange-600" />
            </div>
            <Input
              autoFocus
              value={headerDraft}
              onChange={(e) => setHeaderDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveHeader() }}
              placeholder="ชื่อหมวดหมู่"
              className="h-9 text-base font-bold max-w-sm focus-visible:ring-orange-500/50 bg-white border-slate-200 rounded-[7px] shadow-sm"
            />
            <div className="flex items-center gap-2">
              <Button size="icon" onClick={saveHeader} className="h-9 w-9">
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={cancelHeader} className="h-9 w-9">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
              <FolderOpen className="w-5 h-5 text-orange-500" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-[17px] font-bold text-slate-900">{category.nameTh}</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {category.criteria.length} เกณฑ์การประเมิน
              </p>
            </div>
          </div>
        )}

        {!editingHeader && (
          <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-150 shadow-md rounded-xl p-1 z-50">
                  <DropdownMenuItem 
                    onClick={addCriterion}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 text-orange-500" />
                    <span>เพิ่มเกณฑ์การประเมิน</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setEditingHeader(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate-500" />
                    <span>แก้ไขชื่อหมวดหมู่</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>ลบหมวดหมู่</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9 ml-1 text-slate-400 hover:text-slate-700"
                title={isExpanded ? "ย่อเก็บ" : "ขยายดูเกณฑ์"}
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-slate-50/30">
          {/* Criteria List */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={category.criteria.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col">
                {category.criteria.map((crit) => (
                  <CriterionRow
                    key={crit.id}
                    criterion={crit}
                    onUpdate={(updated) => updateCriterion(crit.id, updated)}
                    onDelete={() => deleteCriterion(crit.id)}
                  />
                ))}
                {category.criteria.length === 0 && (
                  <div className="p-8 text-center border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-400">ยังไม่มีเกณฑ์การประเมินในหมวดหมู่นี้</p>
                  </div>
                )}
                
                <div className="p-3 bg-white border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={addCriterion}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มเกณฑ์การประเมินอีกข้อ
                  </button>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
