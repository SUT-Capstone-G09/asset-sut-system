"use client"

import { AssessmentSetHeader } from "@/features/evaluations/components/assessmentSets/AssessmentSetHeader"
import { AssessmentSetManager } from "@/features/evaluations/components/assessmentSets/AssessmentSetManager"

export default function AssessmentSetsPage() {
  return (
    <div className="space-y-8 p-8">
      <AssessmentSetHeader onCreateNew={() => {}} />
      <AssessmentSetManager />
    </div>
  )
}
