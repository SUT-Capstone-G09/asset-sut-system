"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  CalendarDays,
  UserPlus,
  ClipboardList,
  Send,
  Calendar as CalendarIcon,
  Globe,
  KeyRound,
  Shield,
  X,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  "Standard Retail Hygiene 2024",
  "Service Quality (SQ-Core)",
  "Safety Compliance 2024",
]

const PREVIEW_DATA = [
  { id: 1, tag: "HYGIENE", tagColor: "bg-emerald-100 text-emerald-700", text: "ความสะอาดพื้นที่เตรียมอาหารและอุปกรณ์?", score: 5 },
  { id: 2, tag: "SERVICE", tagColor: "bg-amber-100 text-amber-700", text: "ความรวดเร็วในการให้บริการลูกค้า?", score: 3 },
  { id: 3, tag: "HYGIENE", tagColor: "bg-emerald-100 text-emerald-700", text: "การจัดเก็บวัตถุดิบและควบคุมอุณหภูมิ?", score: 5 },
]

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
  const [channels, setChannels] = useState<ChannelType[]>(["email"])
  const [selectedSet, setSelectedSet] = useState("Standard Retail Hygiene 2024")
  const [emails, setEmails] = useState(["inspector.one@sut.ac.th", "admin.eval@asset.com"])
  const [newEmail, setNewEmail] = useState("")

  const toggleChannel = (c: ChannelType) => {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove))
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newEmail.trim()) {
      e.preventDefault()
      if (!emails.includes(newEmail.trim())) {
        setEmails([...emails, newEmail.trim()])
      }
      setNewEmail("")
    }
  }

  // ── Reusable section wrapper
  const Section = ({ icon: Icon, title, children, className = "" }: { icon: any; title: string; children: React.ReactNode; className?: string }) => (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-slate-800" />
        <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6 pb-20">

      {/* ── 1. Location / Store ─── */}
      <Section icon={MapPin} title="ข้อมูลสถานที่และร้านค้า">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">โซน / อาคาร</label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-11 focus:ring-orange-400 focus:border-orange-400">
                <SelectValue placeholder="เลือกโซนหรืออาคาร" />
              </SelectTrigger>
              <SelectContent>
                {ZONE_OPTIONS.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">ชื่อร้านค้า</label>
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-11 focus:ring-orange-400 focus:border-orange-400">
                <SelectValue placeholder="เลือกชื่อร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                {STORE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* ── 2. Evaluation Period ─── */}
      <Section icon={CalendarDays} title="ระยะเวลาการประเมิน">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">วันที่เริ่มประเมิน</label>
            <div className="relative">
              <input type="text" placeholder="mm/dd/yyyy" className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">วันที่สิ้นสุด</label>
            <div className="relative">
              <input type="text" placeholder="mm/dd/yyyy" className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">กำหนดส่งรายงาน (Due Date)</label>
            <div className="relative">
              <input type="text" placeholder="mm/dd/yyyy" className="w-full h-11 bg-white border border-slate-200 rounded-lg px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── 3. Evaluator Assignment ─── */}
      <Section icon={UserPlus} title="การกำหนดผู้ประเมิน">
        <Shield className="absolute -bottom-8 -right-8 w-40 h-40 text-slate-100 z-0 opacity-50" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setEvaluatorType("internal")}
            className={cn(
              "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-150 relative",
              evaluatorType === "internal" 
                ? "border-orange-500 bg-orange-50/30" 
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className={cn("w-4 h-4", evaluatorType === "internal" ? "text-orange-600" : "text-slate-500")} />
              <span className="font-semibold text-[14px] text-slate-800">Internal (SSO Login)</span>
            </div>
            <p className="text-xs text-slate-500 pl-6">สำหรับเจ้าหน้าที่หรือผู้ตรวจประเมินจากส่วนกลาง (Inspectors)</p>
          </button>

          <button
            type="button"
            onClick={() => setEvaluatorType("external")}
            className={cn(
              "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-150",
              evaluatorType === "external" 
                ? "border-orange-500 bg-orange-50/30" 
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe className={cn("w-4 h-4", evaluatorType === "external" ? "text-orange-600" : "text-slate-500")} />
              <span className="font-semibold text-[14px] text-slate-800">External (Guest/Public)</span>
            </div>
            <p className="text-xs text-slate-500 pl-6">สำหรับลูกค้าภายนอกหรือผู้ใช้บริการทั่วไป</p>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-500 font-medium">ระบุอีเมลผู้ประเมิน (Inspectors Email)</label>
          <div className="flex flex-wrap items-center gap-2 p-2 min-h-11 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent">
            {emails.map(email => (
              <span key={email} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-full">
                {email}
                <button type="button" onClick={() => removeEmail(email)} className="hover:text-slate-300"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <input
              type="text"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              placeholder={emails.length === 0 ? "ใส่อีเมลแล้วกด Enter..." : "เพิ่มอีเมล..."}
              className="flex-1 min-w-[120px] text-sm text-slate-700 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </Section>

      {/* ── 4. Question Set and Criteria ─── */}
      <Section icon={ClipboardList} title="ชุดคำถามและเกณฑ์การตัดสิน">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-medium">เลือกชุดคำถาม (Question Set)</label>
            <Select value={selectedSet} onValueChange={setSelectedSet}>
              <SelectTrigger className="w-full bg-white border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 h-11 focus:ring-orange-400 focus:border-orange-400">
                <SelectValue placeholder="เลือกชุดคำถาม" />
              </SelectTrigger>
              <SelectContent>
                {ASSESSMENT_SETS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50/50 rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">พรีวิวชุดคำถาม</h3>
              <span className="text-xs text-slate-500 font-medium">ทั้งหมด 15 ข้อ</span>
            </div>
            
            <div className="space-y-3">
              {PREVIEW_DATA.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className={cn("inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wide", item.tagColor)}>
                      {item.tag}
                    </span>
                    <span className="text-sm text-slate-800 font-medium">{item.text}</span>
                  </div>
                  <div className="text-sm text-slate-500 font-medium shrink-0">
                    Score: {item.score} pts
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button type="button" className="text-xs font-semibold text-slate-400 hover:text-slate-600">แสดงเพิ่มเติม...</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. Publishing Channels ─── */}
      <Section icon={Send} title="ช่องทางการเผยแพร่">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className={cn(
            "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
            channels.includes("email") ? "border-slate-300 bg-slate-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
          )}>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center shrink-0 border",
              channels.includes("email") ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300"
            )}>
              {channels.includes("email") && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={channels.includes("email")} onChange={() => toggleChannel("email")} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Email Invitation</span>
              <span className="text-xs text-slate-500">ส่งผ่านทางอีเมล</span>
            </div>
          </label>

          <label className={cn(
            "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
            channels.includes("qr") ? "border-slate-300 bg-slate-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
          )}>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center shrink-0 border",
              channels.includes("qr") ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300"
            )}>
              {channels.includes("qr") && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={channels.includes("qr")} onChange={() => toggleChannel("qr")} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">QR Code</span>
              <span className="text-xs text-slate-500">สร้างคิวอาร์โค้ด</span>
            </div>
          </label>

          <label className={cn(
            "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
            channels.includes("sso") ? "border-slate-300 bg-slate-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
          )}>
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center shrink-0 border",
              channels.includes("sso") ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300"
            )}>
              {channels.includes("sso") && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={channels.includes("sso")} onChange={() => toggleChannel("sso")} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">SSO Portal Link</span>
              <span className="text-xs text-slate-500">ฝังในระบบพอร์ทัล</span>
            </div>
          </label>
        </div>
      </Section>

      {/* ── Actions ─── */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/tenants/eval")}
          className="h-11 px-6 rounded-md font-semibold text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
        >
          บันทึกร่าง (Save Draft)
        </Button>
        <Button
          onClick={() => router.push("/admin/tenants/eval")}
          className="h-11 px-6 rounded-md font-bold text-white bg-[#FF6B00] hover:bg-[#E66000] gap-2 shadow-sm"
        >
          <Send className="w-4 h-4" />
          สร้างและส่งคำขอ (Create & Send)
        </Button>
      </div>
    </div>
  )
}
