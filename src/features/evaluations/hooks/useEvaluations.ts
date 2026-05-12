import { useState } from 'react';
import { mockEvaluations } from '../data/mock-evals';

export const useEvaluations = () => {
  const [evaluations] = useState(mockEvaluations);
  
  // เพิ่ม Logic สำหรับการคำนวณเกรด (A, B, C) หรือคำนวณคะแนนรวมที่นี่
  const calculateGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    return 'C';
  };

  return { evaluations, calculateGrade };
};