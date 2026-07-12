import { EvaluationRecord } from "../types/evaluation";

export const mockEvaluations: EvaluationRecord[] = [
  {
    id: "EVAL-001",
    storeName: "ร้านส้มตำแซ่บ",
    location: "โรงอาหารกลาง 1",
    category: "food",
    score: 85,
    maxScore: 100,
    status: "ผ่าน",
    warningCount: 0,
    image: "/shop-1.jpg",
    inspector: "เอกลักษณ์ ยอดเยี่ยม",
    lastAuditDate: "2024-01-12",
    details: [
      { item: "ความสะอาดพื้นผิวและอุปกรณ์ประกอบอาหาร", score: 10, max: 10, status: "Pass", note: "" },
      { item: "การจัดเก็บวัตถุดิบและอุณหภูมิที่เหมาะสม", score: 8, max: 10, status: "Pass", note: "" },
      { item: "การแต่งกายและสุขวิทยาส่วนบุคคล", score: 9, max: 10, status: "Pass", note: "" },
      { item: "การกำจัดขยะและเศษอาหาร", score: 8, max: 10, status: "Pass", note: "" },
    ]
  },
  {
    id: "EVAL-002",
    storeName: "ก๋วยเตี๋ยวเรืออยุธยา",
    location: "ศูนย์อาหารริมน้ำ",
    category: "food",
    score: 45,
    maxScore: 100,
    status: "ไม่ผ่าน",
    warningCount: 8,
    image: "/shop-2.jpg",
    inspector: "สมชาย สายตรวจ",
    lastAuditDate: "2024-02-05",
    details: [
      { item: "ความสะอาดพื้นผิวและอุปกรณ์ประกอบอาหาร", score: 4, max: 10, status: "Fail", note: "พบคราบสกปรกบริเวณเตา" },
      { item: "การจัดเก็บวัตถุดิบและอุณหภูมิที่เหมาะสม", score: 5, max: 10, status: "Improvement", note: "ตู้เย็นไม่เย็นตามเกณฑ์" },
      { item: "การกำจัดขยะและเศษอาหาร", score: 2, max: 10, status: "Fail", note: "ขยะล้นถังและไม่มีฝาปิด" },
    ]
  },
  {
    id: "EVAL-003",
    storeName: "After You Dessert Cafe",
    location: "Zone A, 2nd Floor, Unit A204",
    category: "snack",
    score: 94,
    maxScore: 100,
    status: "ผ่าน",
    warningCount: 0,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80",
    inspector: "เอกลักษณ์ ยอดเยี่ยม",
    lastAuditDate: "2024-01-12",
    details: [
      { item: "ความสะอาดพื้นผิวและอุปกรณ์ประกอบอาหาร", score: 10, max: 10, status: "Pass", note: "" },
      { item: "การจัดเก็บวัตถุดิบและอุณหภูมิที่เหมาะสม", score: 9, max: 10, status: "Pass", note: "ตู้เย็นช่องที่ 2 สูงกว่าเกณฑ์ 1 องศา" },
      { item: "การแต่งกายและสุขวิทยาส่วนบุคคล", score: 10, max: 10, status: "Pass", note: "" },
      { item: "การกำจัดขยะและเศษอาหาร", score: 8, max: 10, status: "Improvement", note: "จุดทิ้งขยะเปียกไม่ปิดสนิท" },
      { item: "ป้ายราคาสินค้าและการแสดงข้อมูลผู้บริโภค", score: 5, max: 5, status: "Pass", note: "" },
      { item: "ระบบดับเพลิงและทางหนีไฟ", score: 5, max: 5, status: "Pass", note: "" },
    ]
  }
];

export const evalCategories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "food", label: "อาหาร" },
    { id: "drink", label: "เครื่องดื่ม" },
    { id: "snack", label: "ของว่าง" },
];

export const evaluationCriteria = [
  "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์",
  "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)",
  "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี",
  "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย",
  "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน"
];

export const evalTableHeaders = [
  { id: "image", label: "รูปภาพ", className: "w-[100px]" },
  { id: "storeName", label: "ชื่อร้านค้า", className: "" },
  { id: "location", label: "สถานที่", className: "" },
  { id: "lastAuditDate", label: "วันที่ตรวจล่าสุด", className: "text-center" },
  { id: "score", label: "คะแนน (100)", className: "text-center" },
  { id: "status", label: "สถานะ", className: "" },
  { id: "warning", label: "ต่ำกว่าเกณฑ์", className: "text-center" },
  { id: "actions", label: "การดำเนินการ", className: "text-right" }
];