import { EvalCategoryHeader } from "@/features/evaluations/components/categories/EvalCategoryHeader"
import { EvalCategoryManager } from "@/features/evaluations/components/categories/EvalCategoryManager"

export default function EvalCategoriesPage() {
  return (
    <div className="space-y-8 p-8">
      <EvalCategoryHeader />
      <EvalCategoryManager />
    </div>
  )
}
