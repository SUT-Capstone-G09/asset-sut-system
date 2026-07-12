"use client"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Plus, ChevronDown, X, Check, Pin } from "lucide-react"
import { DatePickerThai } from "./DatePickerThai"

interface QualificationItem {
  id: string
  text: string
}

interface DocumentItem {
  id: string
  name: string
  isPreset: boolean
  checked?: boolean
}

interface NewsBasicInfoProps {
  data: {
    title: string
    category: string
    referenceId: string
    selectedAsset: string
    scheduleEnabled: boolean
    isFeatured: boolean
    startDate: string
    endDate: string
    resultTimeline: string
    qualifications: QualificationItem[]
    documents: DocumentItem[]
  }
  onChange: (field: string, value: unknown) => void
}



const DEFAULT_CATEGORIES = [
  "เช่าร้านอาหาร",
  "พื้นที่ร้านค้าปลีก",
  "ร้านค้า",
  "สำนักงาน",
  "ห้องประชุม",
  "โรงจอดรถ",
]

export function NewsBasicInfo({ data, onChange }: NewsBasicInfoProps) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [catOpen, setCatOpen] = useState(false)
  const [catInput, setCatInput] = useState("")
  const catRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
        setCatInput("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleAddCategory = () => {
    const trimmed = catInput.trim()
    if (!trimmed || categories.includes(trimmed)) return
    setCategories((prev) => [...prev, trimmed])
    onChange("category", trimmed)
    setCatInput("")
    setCatOpen(false)
  }

  const handleRemoveCategory = (cat: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCategories((prev) => prev.filter((c) => c !== cat))
    if (data.category === cat) onChange("category", "")
  }

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(catInput.toLowerCase())
  )


  return (
    <>
      {/* ── ส่วนที่ 1: ข้อมูลพื้นฐาน ── */}
      <div className="space-y-6">
        {/* หัวข้อประกาศ */}
        <div className="space-y-2">
          <Label className="text-base font-bold">
            หัวข้อประกาศ{" "}
          </Label>
          <Textarea
            className="border-zinc-300 resize-none min-h-[80px]"
            placeholder="ระบุหัวข้อที่ชัดเจน เช่น รับสมัครผู้ประกอบการจำหน่ายอาหาร ประจำปี 2567"
            value={data.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>

        {/* รายละเอียดเพิ่มเติม */}
        <div className="space-y-2">
          <Label className="text-base font-bold">รายละเอียดเพิ่มเติม</Label>
          <Textarea
            className="border-zinc-300 resize-none min-h-[80px]"
            placeholder="ระบุรายละเอียดเพิ่มเติมของประกาศ"
            value={data.resultTimeline}
            onChange={(e) => onChange("resultTimeline", e.target.value)}
          />
        </div>

        {/* หมวดหมู่ + รหัสอ้างอิง */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2" ref={catRef}>
            <Label className="text-base font-bold">หมวดหมู่ประกาศ</Label>
            {/* Custom combobox that supports adding new categories */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setCatOpen((o) => !o); setCatInput("") }}
                className="w-full flex items-center justify-between border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white hover:border-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                <span className={data.category ? "text-zinc-900" : "text-zinc-400"}>
                  {data.category || "เลือกหมวดหมู่"}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>

              {catOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-zinc-200 rounded-md shadow-lg">
                  {/* Search / add input */}
                  <div className="flex items-center border-b border-zinc-100 px-2 py-1.5 gap-1">
                    <input
                      autoFocus
                      value={catInput}
                      onChange={(e) => setCatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory() }}
                      placeholder="ค้นหา หรือพิมพ์หมวดหมู่ใหม่..."
                      className="flex-1 text-sm outline-none bg-transparent placeholder:text-zinc-400"
                    />
                    {catInput.trim() && !categories.includes(catInput.trim()) && (
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-semibold px-1.5 py-0.5 rounded hover:bg-orange-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> เพิ่ม
                      </button>
                    )}
                  </div>

                  {/* Category list */}
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <li
                          key={cat}
                          className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 group"
                          onClick={() => { onChange("category", cat); setCatOpen(false); setCatInput("") }}
                        >
                          <span className="flex items-center gap-2">
                            {data.category === cat && <Check className="w-3.5 h-3.5 text-orange-500" />}
                            {data.category !== cat && <span className="w-3.5" />}
                            {cat}
                          </span>
                          {!DEFAULT_CATEGORIES.includes(cat) && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveCategory(cat, e)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-zinc-400">ไม่พบหมวดหมู่ที่ค้นหา</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">รหัสอ้างอิงประกาศ</Label>
            <Input
              className="border-zinc-300 text-zinc-500"
              placeholder="ASSET-2024-0012"
              value={data.referenceId}
              onChange={(e) => onChange("referenceId", e.target.value)}
            />
          </div>
        </div>

        {/* เลือกพื้นที่เช่า */}
        <div className="space-y-2">
          <Label className="text-base font-bold">
            เลือกพื้นที่เช่า
          </Label>
          <Select
            value={data.selectedAsset}
            onValueChange={(val) => onChange("selectedAsset", val)}
          >
            <SelectTrigger className="border-zinc-300 max-w-sm">
              <SelectValue placeholder="-- เลือกพื้นที่จากระบบ --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset-001">อาคาร A ชั้น 1 ห้อง 101</SelectItem>
              <SelectItem value="asset-002">อาคาร B ชั้น 2 ห้อง 205</SelectItem>
              <SelectItem value="asset-003">อาคาร C ชั้น 3 ห้อง 310</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ปักหมุดเป็นข่าวเด่น */}
        <div
          className={`flex items-start gap-4 rounded-xl border px-5 py-4 cursor-pointer transition-all duration-200 ${data.isFeatured
              ? "border-orange-400 bg-orange-50 shadow-sm"
              : "border-zinc-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
            }`}
          onClick={() => onChange("isFeatured", !data.isFeatured)}
        >
          {/* Toggle pill */}
          <button
            type="button"
            aria-pressed={data.isFeatured}
            onClick={(e) => { e.stopPropagation(); onChange("isFeatured", !data.isFeatured) }}
            className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${data.isFeatured ? "bg-orange-500" : "bg-zinc-200"
              }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${data.isFeatured ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Pin
                className={`w-4 h-4 flex-shrink-0 transition-colors ${data.isFeatured ? "text-orange-500" : "text-zinc-400"
                  }`}
              />
              <span className={`text-sm font-bold ${data.isFeatured ? "text-orange-600" : "text-zinc-700"
                }`}>
                ปักหมุดเป็นข่าวเด่น
              </span>
              {data.isFeatured && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  เปิดใช้งาน
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              เปิดใช้งานเพื่อให้ประกาศนี้แสดงผลในกล่องขนาดใหญ่บนสุดของหน้าแรก
            </p>
          </div>
        </div>

        {/* ตั้งเวลาเผยแพร่ */}
        <div className="space-y-4">
          <Label className="text-base font-bold">
            ตั้งเวลาเผยแพร่
          </Label>

          {/* วันที่เริ่ม / สิ้นสุด */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold">
                วันที่เริ่มประกาศ
              </Label>
              <DatePickerThai
                value={data.startDate}
                onChange={(val) => onChange("startDate", val)}
                placeholder="เลือกวันที่เริ่มประกาศ"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold">
                วันที่สิ้นสุดประกาศ
              </Label>
              <DatePickerThai
                value={data.endDate}
                onChange={(val) => onChange("endDate", val)}
                placeholder="เลือกวันที่สิ้นสุดประกาศ"
              />
            </div>
          </div>

        </div>

      </div>

    </>
  )
}
