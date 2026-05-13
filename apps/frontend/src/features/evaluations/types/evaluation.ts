// src/features/evaluations/types/evaluation.ts

export type EvalStatus = 'ผ่าน' | 'ไม่ผ่าน' | 'ปรับปรุง';

export interface EvaluationRecord {
  id: string;
  storeName: string;
  location: string;
  category: 'food' | 'drink' | 'snack';
  score: number;
  maxScore: number;
  status: EvalStatus;
  warningCount: number;
  image?: string;
  inspector: string;
  lastAuditDate: string;
  details: {
    item: string;
    score: number;
    max: number;
    status: 'Pass' | 'Improvement' | 'Fail';
    note: string;
  }[];
}