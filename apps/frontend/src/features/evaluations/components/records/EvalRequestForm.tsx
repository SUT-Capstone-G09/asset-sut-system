"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Store,
  Users,
  UserCog,
  Mail,
  QrCode,
  KeyRound,
  ChevronDown,
  ListChecks,
  Send,
  X,
  Check,
  FolderOpen,
  Eye,
  AlertCircle,
} from "lucide-react"

// ── Static options ─────────────────────────────────────────────────
const ZONE_OPTIONS = [
  "อาคารวิชาการ 1",
  "อาคารวิชาการ 2",
  "อาคารวิชาการ 3",
  "ศูนย์อาหารกลาง",
  "โรงอาหาร B",
  "อาคารกิจกรรมนักศึกษา",
  "หอพักนักศึกษา",
]

const STORE_OPTIONS = [
  "ร้านส้มตำแซ่บ",
  "ก๋วยเตี๋ยวเรืออยุธยา",
  "After You Dessert Cafe",
  "7-Eleven SUT Branch",
  "Wawee Coffee",
  "ร้านอาหารตามสั่ง",
]

const ASSESSMENT_SETS = [
  { id: "set-1", name: "Hygiene Standard v2", count: 24 },
  { id: "set-2", name: "Service Quality (SQ-Core)", count: 18 },
  { id: "set-3", name: "Safety Compliance 2024", count: 12 },
]

const MOCK_CRITERIA = {
  "set-1": [
    {
      categoryId: "cat-1",
      categoryName: "สุขอนามัยและความสะอาด",
      color: "text-red-600 bg-red-50 border-red-200",
      dot: "bg-red-500",
      items: [
        { id: "c1", code: "#CRIT-101", name: "ความสะอาดพื้นผิวสัมผัสและอุปกรณ์ปรุงอาหาร", desc: "ดูแลรักษาพื้นผิวให้สะอาดตามมาตรฐานสุขอนามัย" },
        { id: "c2", code: "#CRIT-102", name: "การจัดเก็บวัตถุดิบและอุณหภูมิที่เหมาะสม", desc: "ควบคุมอุณหภูมิตู้เย็นและแช่แข็งตามเกณฑ์" },
        { id: "c3", code: "#CRIT-103", name: "การแต่งกายและสุขลักษณะส่วนบุคคลของพนักงาน", desc: "สวมชุดพนักงาน หมวก ถุงมือ ครบถ้วน" },
      ],
    },
    {
      categoryId: "cat-2",
      categoryName: "มาตรฐานธุรกรรม",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      dot: "bg-blue-500",
      items: [
        { id: "c4", code: "#CRIT-201", name: "ความน่าเชื่อถือของการชำระเงินดิจิทัล", desc: "ระบบชำระเงิน QR ใช้งานได้ตลอดเวลา" },
        { id: "c5", code: "#CRIT-202", name: "ราคาสินค้าตรงตามป้ายที่ติดแสดง", desc: "ราคาถูกต้องและโปร่งใส" },
      ],
    },
  ],
  "set-2": [
    {
      categoryId: "cat-3",
      categoryName: "คุณภาพการบริการ",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
      items: [
        { id: "c6", code: "#CRIT-301", name: "ความรวดเร็วในการให้บริการ", desc: "เวลาตอบสนองต่อลูกค้าไม่เกินมาตรฐาน" },
        { id: "c7", code: "#CRIT-302", name: "ความสุภาพและมนุษยสัมพันธ์", desc: "กิริยามารยาทและการสื่อสารกับลูกค้า" },
      ],
    },
  ],
  "set-3": [
    {
      categoryId: "cat-4",
      categoryName: "ความปลอดภัย",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      items: [
        { id: "c8", code: "#CRIT-401", name: "อุปกรณ์ดับเพลิงพร้อมใช้งาน", desc: "ถังดับเพลิงไม่หมดอายุ อยู่ในตำแหน่งที่เข้าถึงง่าย" },
      ],
    },
  ],
} as Record<string, { categoryId: string; categoryName: string; color: string; dot: string; items: { id: string; code: string; name: string; desc: string }[] }[]>

// ── Types ─────────────────────────────────────────────────
type EvaluatorType = "internal" | "external"
type ChannelType = "email" | "qr" | "sso"

// ── Main component ─────────────────────────────────────────────────
export function EvalRequestForm() {
  const router = useRouter()

  // Field state
  const [zone, setZone] = useState("")
  const [store, setStore] = useState("")
  const [evaluatorType, setEvaluatorType] = useState<EvaluatorType>("internal")
  const [assignedEvaluator, setAssignedEvaluator] = useState("")
  const [channels, setChannels] = useState<ChannelType[]>(["email"])
  const [selectedSet, setSelectedSet] = useState("")
  const [checkedCriteria, setCheckedCriteria] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const toggleChannel = (c: ChannelType) => {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  const handleSetChange = (setId: string) => {
    setSelectedSet(setId)
    // auto-select all criteria in the new set
    const cats = MOCK_CRITERIA[setId] ?? []
    setCheckedCriteria(cats.flatMap((c) => c.items.map((i) => i.id)))
  }

  const toggleCriterion = (id: string) => {
    setCheckedCriteria((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const currentCriteria = MOCK_CRITERIA[selectedSet] ?? []
  const totalCriteria = currentCriteria.reduce((s, c) => s + c.items.length, 0)
  const selectedCount = checkedCriteria.length

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => router.push("/admin/tenants/eval"), 1200)
  }

  // ── Reusable section wrapper
  const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* ── Zone / Store ─── */}
      <Section title="สถานที่และร้านค้า">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Zone dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> โซน / อาคาร
            </label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-6 text-sm text-slate-700 focus:ring-orange-400/50 focus:border-orange-400 focus-visible:ring-orange-400/50">
                <SelectValue placeholder="เลือกโซน / อาคาร" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-150 shadow-md">
                {ZONE_OPTIONS.map((z) => (
                  <SelectItem key={z} value={z} className="rounded-lg text-slate-700 cursor-pointer">
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> ชื่อร้านค้า
            </label>
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-6 text-sm text-slate-700 focus:ring-orange-400/50 focus:border-orange-400 focus-visible:ring-orange-400/50">
                <SelectValue placeholder="เลือกร้านค้า" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-150 shadow-md">
                {STORE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="rounded-lg text-slate-700 cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* ── Evaluator Type ─── */}
      <Section title="ประเภทผู้ประเมิน">
        <div className="grid grid-cols-2 gap-3">
          {(["internal", "external"] as EvaluatorType[]).map((type) => {
            const isSelected = evaluatorType === type
            const Icon = type === "internal" ? UserCog : Users
            return (
              <button
                key={type}
                type="button"
                onClick={() => setEvaluatorType(type)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                  isSelected
                    ? "border-orange-400 bg-orange-50/60"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${isSelected ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isSelected ? "text-orange-700" : "text-slate-700"}`}>
                    {type === "internal" ? "ภายใน (Internal)" : "ภายนอก (External)"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {type === "internal"
                      ? "แอดมินหรือบุคลากร SUT ที่ได้รับมอบหมาย"
                      : "ผู้ตรวจสอบบุคคลที่สามหรือลูกค้า"}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Assigned evaluator */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ผู้ประเมินที่มอบหมาย (อีเมลหรือชื่อ)
          </label>
          <input
            type="text"
            value={assignedEvaluator}
            onChange={(e) => setAssignedEvaluator(e.target.value)}
            placeholder="เช่น inspector@sut.ac.th"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-colors"
          />
        </div>
      </Section>

      {/* ── Assessment Channels ─── */}
      <Section title="ช่องทางการประเมิน">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { id: "email", label: "Email Invitation", Icon: Mail },
              { id: "qr", label: "QR Code Link", Icon: QrCode },
              { id: "sso", label: "SSO Login Required", Icon: KeyRound },
            ] as { id: ChannelType; label: string; Icon: React.ElementType }[]
          ).map(({ id, label, Icon }) => {
            const active = channels.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleChannel(id)}
                className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-xl border-2 transition-all duration-150 ${
                  active
                    ? "border-orange-400 bg-orange-50/60 text-orange-600"
                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
                {active && (
                  <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ── Question Set ─── */}
      <Section title="ชุดคำถามและเกณฑ์การประเมิน">
        {/* Set selector */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> เลือกชุดคำถาม
          </label>
          <Select value={selectedSet} onValueChange={handleSetChange}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-6 text-sm text-slate-700 focus:ring-orange-400/50 focus:border-orange-400 focus-visible:ring-orange-400/50">
              <SelectValue placeholder="-- เลือกชุดคำถาม --" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-150 shadow-md">
              {ASSESSMENT_SETS.map((s) => (
                <SelectItem key={s.id} value={s.id} className="rounded-lg text-slate-700 cursor-pointer">
                  {s.name} ({s.count} ข้อ)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Criteria list */}
        {selectedSet ? (
          <>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-slate-700">เลือกเกณฑ์การประเมิน</span>
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                เลือก {selectedCount} / {totalCriteria} ข้อ
              </span>
            </div>

            <div className="space-y-4">
              {currentCriteria.map((cat) => (
                <div key={cat.categoryId}>
                  {/* Category label */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-2 ${cat.color}`}>
                    <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                    <FolderOpen className="w-3 h-3" />
                    {cat.categoryName}
                  </div>

                  {/* Criterion rows */}
                  <div className="space-y-2">
                    {cat.items.map((item) => {
                      const checked = checkedCriteria.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleCriterion(item.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                            checked
                              ? "border-orange-300 bg-orange-50/50"
                              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {/* Checkbox */}
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              checked
                                ? "bg-orange-500 border-orange-500"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                                {item.code}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {item.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                          </div>

                          {/* Rating scale */}
                          <div className="flex items-center gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  n === 5
                                    ? "bg-slate-800 text-white"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <AlertCircle className="w-8 h-8 opacity-40" />
            <p className="text-sm font-medium">กรุณาเลือกชุดคำถามก่อน</p>
            <p className="text-xs text-slate-400">เกณฑ์การประเมินจะแสดงที่นี่</p>
          </div>
        )}
      </Section>

      {/* ── Preview ─── */}
      {selectedSet && checkedCriteria.length > 0 && (
        <Section title="ตัวอย่างคำถาม (Preview)">
          <ol className="space-y-2.5 list-none">
            {currentCriteria
              .flatMap((cat) => cat.items)
              .filter((item) => checkedCriteria.includes(item.id))
              .map((item, idx) => (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-500 mr-2">{idx + 1}.</span>
                    {item.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400 font-medium whitespace-nowrap">
                    (Rating 1-5)
                  </span>
                </li>
              ))}
          </ol>
        </Section>
      )}

      {/* ── Actions ─── */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={submitted}
          className="w-full max-w-sm flex items-center justify-center gap-2 py-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-150"
        >
          <Send className="w-4 h-4" />
          {submitted ? "กำลังส่งคำร้อง..." : "สร้างคำร้องประเมิน"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/admin/tenants/eval")}
          className="flex items-center gap-1.5 text-sm"
        >
          <X className="w-3.5 h-3.5" />
          ยกเลิกและออก
        </Button>
      </div>
    </div>
  )
}
