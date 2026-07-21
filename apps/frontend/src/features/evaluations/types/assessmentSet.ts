// src/features/evaluations/types/assessmentSet.ts

export type CriterionTag = "MANDATORY" | "PHOTO REQUIRED" | "TECHNICAL" | "OPTIONAL"

export type AssessmentPermission = "admin" | "staff" | "external"

export type AssessmentCriterion = {
  id: string
  code: string // e.g. #CRIT-102
  nameTh: string
  tags: CriterionTag[]
  maxScore?: number
}

export type AssessmentCategory = {
  id: string
  nameTh: string
  permissions: AssessmentPermission[]
  criteria: AssessmentCriterion[]
}

export type AssessmentSet = {
  id: string
  name: string
  lastUpdated: string
  categories: AssessmentCategory[]
}
