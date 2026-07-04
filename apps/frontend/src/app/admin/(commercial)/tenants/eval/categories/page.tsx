import { EvalCategoryHeader } from "@/features/evaluations/components/EvalCategoryHeader"
import { EvalCategoryManager } from "@/features/evaluations/components/EvalCategoryManager"

export default function EvalCategoriesPage() {
  return (
    <div className="space-y-8 p-8">
      <EvalCategoryHeader />
      <EvalCategoryManager />
    </div>
  )
}
