// src/features/evaluations/types/category.ts

export type Criterion = {
  id: string
  nameTh: string
  description: string
  maxScore?: number
}

export type Category = {
  id: string
  nameTh: string
  criteria: Criterion[]
}
