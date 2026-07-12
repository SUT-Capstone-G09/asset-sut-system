"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, FileText } from "lucide-react"

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

interface NewsQualificationsInfoProps {
  qualifications: QualificationItem[]
  documents: DocumentItem[]
  onChange: (field: string, value: unknown) => void
}

const PRESET_DOCUMENTS = [
  { id: "id-card", name: "สำเนาบัตรประชาชน" },
  { id: "house-reg", name: "ทะเบียนบ้าน" },
  { id: "company-cert", name: "หนังสือรับรองนิติบุคคล" },
]

export function NewsQualificationsInfo({
  qualifications,
  documents,
  onChange,
}: NewsQualificationsInfoProps) {

  // Qualifications handlers
  const addQualification = () => {
    const newItem: QualificationItem = { id: Date.now().toString(), text: "" }
    onChange("qualifications", [...qualifications, newItem])
  }

  const updateQualification = (id: string, text: string) => {
    onChange(
      "qualifications",
      qualifications.map((q) => (q.id === id ? { ...q, text } : q))
    )
  }

  const removeQualification = (id: string) => {
    onChange(
      "qualifications",
      qualifications.filter((q) => q.id !== id)
    )
  }

  // Documents handlers
  const togglePresetDocument = (presetId: string, presetName: string, checked: boolean) => {
    const exists = documents.find((d) => d.id === presetId)
    if (checked && !exists) {
      onChange("documents", [
        ...documents,
        { id: presetId, name: presetName, isPreset: true, checked: true },
      ])
    } else if (!checked && exists) {
      onChange("documents", documents.filter((d) => d.id !== presetId))
    }
  }

  const addCustomDocument = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      name: "",
      isPreset: false,
    }
    onChange("documents", [...documents, newItem])
  }

  const updateDocument = (id: string, name: string) => {
    onChange(
      "documents",
      documents.map((d) => (d.id === id ? { ...d, name } : d))
    )
  }

  const removeDocument = (id: string) => {
    onChange("documents", documents.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label className="text-base font-bold">คุณสมบัติและเอกสาร</Label>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* คอลัมน์ซ้าย: คุณสมบัติผู้สมัคร */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-base font-black">คุณสมบัติผู้สมัคร</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={addQualification}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors font-semibold"
              >
                <Plus className="w-3 h-3" />
                เพิ่ม รายการ
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {qualifications.map((q, index) => (
              <div key={q.id} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-400 text-white text-sm font-bold flex items-center justify-center mt-1">
                  {index + 1}
                </span>
                <Textarea
                  className="border-zinc-200 resize-none min-h-[80px] flex-1 text-sm"
                  placeholder="ระบุคุณสมบัติ เช่น มีสัญชาติไทย"
                  value={q.text}
                  onChange={(e) => updateQualification(q.id, e.target.value)}
                />
                <button
                  onClick={() => removeQualification(q.id)}
                  className="text-zinc-300 hover:text-red-400 transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {qualifications.length === 0 && (
              <div className="text-center py-6 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
                ยังไม่มีรายการคุณสมบัติ กด &quot;+ เพิ่ม รายการ&quot; เพื่อเริ่มต้น
              </div>
            )}
          </div>
        </div>

        {/* คอลัมน์ขวา: เอกสารที่ต้องใช้ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-base font-black">เอกสารที่ต้องใช้</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={addCustomDocument}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors font-semibold"
              >
                <Plus className="w-3 h-3" />
                เพิ่ม รายการ
              </button>
            </div>
          </div>

          {/* เลือกด่วน (preset checkboxes) */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-medium">เลือกด่วน:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {PRESET_DOCUMENTS.map((preset) => {
                const isChecked = !!documents.find((d) => d.id === preset.id)
                return (
                  <div key={preset.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`preset-${preset.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        togglePresetDocument(preset.id, preset.name, !!checked)
                      }
                      className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <label
                      htmlFor={`preset-${preset.id}`}
                      className="text-sm text-zinc-700 cursor-pointer"
                    >
                      {preset.name}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* รายการเอกสาร */}
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 border border-zinc-200 rounded-lg px-4 py-3 bg-white"
              >
                <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                {doc.isPreset ? (
                  <span className="flex-1 text-sm text-zinc-700">{doc.name}</span>
                ) : (
                  <Input
                    className="flex-1 border-0 border-b border-zinc-200 rounded-none px-0 text-sm h-7 focus-visible:ring-0"
                    placeholder="ชื่อเอกสาร..."
                    value={doc.name}
                    onChange={(e) => updateDocument(doc.id, e.target.value)}
                  />
                )}
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="text-zinc-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-6 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
                ยังไม่มีรายการเอกสาร
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
