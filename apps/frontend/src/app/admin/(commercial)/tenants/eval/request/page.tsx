import { EvalRequestForm } from "@/features/evaluations/components/records/EvalRequestForm"
import { FilePlus } from "lucide-react"

export default function EvalRequestPage() {
  return (
    <div className="space-y-8 p-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 shrink-0 mt-0.5">
          <FilePlus className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            สร้างคำขอประเมินร้านค้า
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดค่าและสร้างคำขอประเมินสำหรับพื้นที่เชิงพาณิชย์และผู้ประกอบการภายใน SUT
          </p>
        </div>

        <span className="ml-auto shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-orange-300 text-orange-600 bg-orange-50">
          New Form
        </span>
      </div>

      {/* Form */}
      <EvalRequestForm />
    </div>
  )
}
