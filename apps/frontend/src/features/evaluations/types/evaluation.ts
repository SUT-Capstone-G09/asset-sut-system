// src/features/evaluations/types/evaluation.ts

export type EvalStatus = 'ผ่าน' | 'ไม่ผ่าน' | 'ปรับปรุง';

export interface EvaluationRecord {
  id: string;
  storeName: string;
  location: string;
  category:
    | "cafe_drink_snack"
    | "convenience_store"
    | "vending_machine"
    | "laundromat"
    | "atm"
    | "telecom_network"
    | "it_equipment"
    | "public_relations_sign"
    | "copier_printer"
    | "space_utilization"
    | "canteen";
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