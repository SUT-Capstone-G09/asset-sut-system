import { EvalRequestForm } from "@/features/evaluations/components/records/EvalRequestForm"
import { FilePlus } from "lucide-react"

export default function EvalRequestPage() {
  return (
    <div className="space-y-8 p-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          สร้างคำขอประเมินใหม่
        </h1>
        <p className="text-sm text-slate-500">
          กำหนดรายละเอียดและเงื่อนไขการประเมินสำหรับร้านค้าภายในพื้นที่
        </p>
      </div>

      {/* Form */}
      <EvalRequestForm />
    </div>
  )
}
