"use client"

import { useState } from "react"
import { ClipboardList } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CriterionItem = {
  id: string
  text: string
  score: number | null
  note?: string
  section?: string // optional section separator label
}

export type CriteriaTab = {
  id: string
  labelEn: string
  labelTh: string
}

// ─── Default tabs ─────────────────────────────────────────────────────────────

export const DEFAULT_EVAL_TABS: CriteriaTab[] = [
  { id: "hygiene",  labelEn: "HYGIENE CHECKLIST",  labelTh: "สุขอนามัย"        },
  { id: "payment",  labelEn: "PAYMENT HISTORY",    labelTh: "ประวัติชำระเงิน"  },
  { id: "other",    labelEn: "OTHER ASSESSMENT",   labelTh: "การประเมินอื่น"   },
]

// ─── Default criteria (matches mock-evals.ts evaluationCriteria) ─────────────

export const DEFAULT_EVAL_CRITERIA: Record<string, CriterionItem[]> = {
  hygiene: [
    { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: null, note: "" },
    { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: null, note: "" },
    { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: null, note: "" },
    { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: null, note: "" },
    { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: null, note: "" },
  ],
  payment: [
    { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: null, note: "", section: "หัวข้อ: ประวัติการชำระเงิน" },
    { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: null, note: "" },
    { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: null, note: "" },
  ],
  other: [
    { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: null, note: "" },
    { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: null, note: "" },
  ],
}

// ─── Score Buttons ────────────────────────────────────────────────────────────

function ScoreButtons({
  value,
  onChange,
  readOnly = false,
}: {
  value: number | null
  onChange: (score: number) => void
  readOnly?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${readOnly ? "pointer-events-none" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className={readOnly ? "cursor-default" : "cursor-pointer"}>
          <input
            type="radio"
            name={`score-${n}`}
            value={n}
            checked={value === n}
            disabled={readOnly}
            onChange={() => onChange(n)}
            className="peer sr-only"
          />
          <span
            className={`flex size-9 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-150
              ${
                value === n
                  ? "border-orange-500 bg-orange-500 text-white shadow-md scale-110"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-orange-400 hover:text-orange-500"
              } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => !readOnly && onChange(n)}
          >
            {n}
          </span>
        </label>
      ))}
      {/* N/A button */}
      <label className={readOnly ? "cursor-default" : "cursor-pointer"}>
        <input
          type="radio"
          name="score-na"
          value={-1}
          checked={value === -1}
          disabled={readOnly}
          onChange={() => onChange(-1)}
          className="peer sr-only"
        />
        <span
          className={`flex h-9 px-2 items-center justify-center rounded-lg border-2 text-xs font-bold transition-all duration-150
            ${
              value === -1
                ? "border-slate-500 bg-slate-500 text-white shadow-md scale-110"
                : "border-zinc-300 bg-white text-zinc-500 hover:border-slate-400 hover:text-slate-600"
            } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          onClick={() => !readOnly && onChange(-1)}
        >
          N/A
        </span>
      </label>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EvalAssessmentCriteriaProps {
  tabs?: CriteriaTab[]
  /** Controlled mode */
  criteria?: Record<string, CriterionItem[]>
  onChange?: (criteria: Record<string, CriterionItem[]>) => void
  /** Hide add/delete controls (read-only view mode) */
  readOnly?: boolean
}

export function EvalAssessmentCriteria({
  tabs = DEFAULT_EVAL_TABS,
  criteria: externalCriteria,
  onChange,
  readOnly = false,
}: EvalAssessmentCriteriaProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "hygiene")
  const [internalCriteria, setInternalCriteria] = useState<Record<string, CriterionItem[]>>(
    DEFAULT_EVAL_CRITERIA
  )

  const criteria = externalCriteria ?? internalCriteria

  const updateCriteria = (next: Record<string, CriterionItem[]>) => {
    if (onChange) onChange(next)
    else setInternalCriteria(next)
  }

  const handleScoreChange = (id: string, score: number) => {
    updateCriteria({
      ...criteria,
      [activeTab]: criteria[activeTab].map((item) =>
        item.id === id ? { ...item, score } : item
      ),
    })
  }

  const handleNoteChange = (id: string, note: string) => {
    updateCriteria({
      ...criteria,
      [activeTab]: criteria[activeTab].map((item) =>
        item.id === id ? { ...item, note } : item
      ),
    })
  }

  const handleTextChange = (id: string, text: string) => {
    updateCriteria({
      ...criteria,
      [activeTab]: criteria[activeTab].map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    })
  }





  const activeTabData = tabs.find((t) => t.id === activeTab) ?? tabs[0]
  const items = criteria[activeTab] ?? []

  // Compute answered count for progress
  const answeredCount = items.filter((i) => i.score !== null).length
  const totalCount = items.length

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm ring-1 ring-slate-200">

      {/* ── Tab Bar ── */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3.5 text-sm font-bold transition-all duration-200
              ${
                activeTab === tab.id
                  ? "text-zinc-900 border-b-2 border-zinc-900 bg-white"
                  : "text-zinc-400 hover:text-zinc-600 bg-slate-50"
              }`}
          >
            {tab.labelTh}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-zinc-900">
              {activeTabData?.labelTh}
            </h2>
          </div>
        </div>

        {/* ── Column headers ── */}
        <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 border border-slate-100">
          <span>รายละเอียดเกณฑ์การประเมิน</span>
          <span className="tracking-widest">คะแนน (1-5)</span>
        </div>

        {/* ── Rows ── */}
        <div className="space-y-0 max-h-[420px] overflow-y-auto pr-2">
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400">
              ยังไม่มีเกณฑ์การประเมิน
              {!readOnly && " — กด \"เพิ่มเกณฑ์\" เพื่อเริ่มต้น"}
            </p>
          )}

          {items.map((item) => (
            <div key={item.id}>
              {/* Section separator */}
              {item.section && (
                <p className="pt-4 pb-2 text-sm italic text-slate-400">{item.section}</p>
              )}

              {/* Row */}
              <div className="flex flex-col gap-3 border-b border-slate-100 py-5 last:border-b-0 group">
                <div className="flex items-center justify-between gap-6">
                  {/* Criterion text */}
                  <div className="flex-1 flex items-start gap-2 min-w-0">
                    {readOnly ? (
                      <p className="text-sm font-medium text-slate-700 leading-6">{item.text}</p>
                    ) : (
                      <input
                        value={item.text}
                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                        placeholder="ระบุรายละเอียดเกณฑ์การประเมิน..."
                        className="flex-1 text-sm text-slate-700 font-medium leading-6 bg-transparent border-none outline-none focus:bg-slate-50 rounded px-1 -ml-1 placeholder:text-zinc-300"
                      />
                    )}

                  </div>

                  {/* Score buttons */}
                  <div className="flex shrink-0 gap-2">
                    <ScoreButtons
                      value={item.score}
                      onChange={(score) => handleScoreChange(item.id, score)}
                      readOnly={readOnly}
                    />
                  </div>
                </div>

                {/* Note input/display for this criterion */}
                <div className="pl-1">
                  {readOnly ? (
                    item.note ? (
                      <p className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 inline-block">
                        <span className="font-bold text-orange-600">หมายเหตุ:</span> {item.note}
                      </p>
                    ) : null
                  ) : (
                    <input
                      type="text"
                      value={item.note || ""}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      placeholder="เพิ่มหมายเหตุสำหรับเกณฑ์ข้อนี้ (ถ้ามี)..."
                      className="w-full max-w-xl text-xs text-slate-500 bg-slate-100 border-none rounded-[7px] px-2.5 py-1.5 outline-none transition-all"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Note ── */}
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-xs text-orange-700">
            <span className="font-bold">หมายเหตุ:</span>{" "}
            ให้คะแนนตามระดับความสำคัญ โดย 1 = ต่ำมาก, 5 = สูงมาก
          </p>
        </div>



        {/* ── Progress bar ── */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {answeredCount}/{totalCount} ข้อ
            </span>
          </div>
        )}

      </div>
    </div>
  )
}
