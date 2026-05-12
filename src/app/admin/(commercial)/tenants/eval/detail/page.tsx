"use client"

import React from "react"
import { AdminEvalDetail } from "@/features/evaluations/components/AdminEvalDetail"
import { AdminEvalDetailHeader } from "@/features/evaluations/components/AdminEvalDetailHeader"

export default function TenantEvaluationDetailPage() {
  return (
    <div className="min-h-screen pb-20">
      <AdminEvalDetailHeader />
      <AdminEvalDetail />
    </div>
  )
}