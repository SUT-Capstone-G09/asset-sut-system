import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { AdminEvalForm } from "@/features/evaluations/components/records/AdminEvalForm";
import { AdminEvalFormHeader } from "@/features/evaluations/components/records/AdminEvalFormHeader";

export default function EvaluationFormPage() {
  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen font-sans">
      <AdminEvalFormHeader />
      <AdminEvalForm />
    </div>
  )
}