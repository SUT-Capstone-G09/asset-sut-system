"use client"

import Link from "next/link"
import { Plus, Tags, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AssessmentSetHeaderProps {
  onCreateNew: () => void
}

export function AssessmentSetHeader({ onCreateNew }: AssessmentSetHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f26522]/10 flex items-center justify-center text-[#f26522]">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ชุดแบบประเมินทั้งหมด
          </h1>
        </div>
        <p className="text-slate-500 pl-14 text-sm">
          จัดการชุดคำถามที่ใช้ในการประเมินร้านค้า พร้อมกำหนดสิทธิ์ผู้ตรวจสำหรับแต่ละหมวดหมู่
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 sm:self-start mt-2 sm:mt-0">
        <Link href="/admin/tenants/eval/categories">
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2.5 h-10">
            <Tags className="h-4 w-4" />
            จัดการหมวดหมู่มาตรฐาน
          </Button>
        </Link>
        <Button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 h-10"
        >
          <Plus className="h-4 w-4" />
          สร้างชุดแบบประเมิน
        </Button>
      </div>
    </div>
  )
}
