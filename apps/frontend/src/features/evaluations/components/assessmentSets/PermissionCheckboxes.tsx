"use client"

import { ShieldCheck } from "lucide-react"
import { AssessmentPermission } from "../../types/assessmentSet"

// ── Config ──────────────────────────────────────────────────────────
export const PERMISSION_CONFIG: {
  id: AssessmentPermission
  label: string
  color: string
  checkColor: string
  borderColor: string
  bgColor: string
}[] = [
  {
    id: "admin",
    label: "แอดมิน",
    color: "text-violet-700",
    checkColor: "bg-violet-600",
    borderColor: "border-violet-300",
    bgColor: "bg-violet-50",
  },
  {
    id: "staff",
    label: "บุคลากร",
    color: "text-blue-700",
    checkColor: "bg-blue-600",
    borderColor: "border-blue-300",
    bgColor: "bg-blue-50",
  },
  {
    id: "external",
    label: "ภายนอก",
    color: "text-emerald-700",
    checkColor: "bg-emerald-600",
    borderColor: "border-emerald-300",
    bgColor: "bg-emerald-50",
  },
]

// ── Component ──────────────────────────────────────────────────────────
interface PermissionCheckboxesProps {
  permissions: AssessmentPermission[]
  onChange: (updated: AssessmentPermission[]) => void
}

export function PermissionCheckboxes({ permissions, onChange }: PermissionCheckboxesProps) {
  const toggle = (id: AssessmentPermission) => {
    onChange(
      permissions.includes(id)
        ? permissions.filter((p) => p !== id)
        : [...permissions, id]
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" />
        สิทธิ์:
      </div>

      {PERMISSION_CONFIG.map((perm) => {
        const checked = permissions.includes(perm.id)
        return (
          <button
            key={perm.id}
            type="button"
            onClick={() => toggle(perm.id)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-[11px] font-bold
              transition-all duration-200 select-none
              ${
                checked
                  ? `${perm.bgColor} ${perm.borderColor} ${perm.color} shadow-sm`
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            {checked && (
              <svg
                className="w-3 h-3"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
            {perm.label}
          </button>
        )
      })}
    </div>
  )
}
