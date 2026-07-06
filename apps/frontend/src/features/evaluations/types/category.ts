// src/features/evaluations/types/category.ts

export type Criterion = {
  id: string
  nameTh: string
  description: string
}

export type Category = {
  id: string
  nameTh: string
  criteria: Criterion[]
}
