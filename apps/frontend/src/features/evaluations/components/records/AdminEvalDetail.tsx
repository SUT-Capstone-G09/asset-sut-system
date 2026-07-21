import React, { useState, useMemo } from "react"
import { 
  MapPin, 
  Star, 
  History, 
  AlertCircle, 
  Info as InfoIcon,
  Calendar,
  User,
  Loader2,
  ShieldCheck, 
  Users, 
  Mail, 
  QrCode, 
  KeyRound, 
  CheckSquare, 
  ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EvalAssessmentCriteria } from "./EvalAssessmentCriteria"
import { cn } from "@/lib/utils"
import { EvaluatorType, EvalChannel } from "../../types/evaluation"

// Helper for evaluator type badge
const getEvaluatorBadge = (type: EvaluatorType) => {
  switch (type) {
    case "admin":
      return { label: "แอดมิน", color: "bg-violet-100 text-violet-700 border-violet-200", icon: ShieldCheck };
    case "staff":
      return { label: "บุคลากร", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckSquare };
    case "external":
      return { label: "ภายนอก", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Users };
    default:
      return { label: "ไม่ระบุ", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Users };
  }
};

// Helper for channel icon
const getChannelIcon = (channel: EvalChannel) => {
  switch (channel) {
    case "email": return <Mail className="w-3.5 h-3.5" />;
    case "qr": return <QrCode className="w-3.5 h-3.5" />;
    case "sso": return <KeyRound className="w-3.5 h-3.5" />;
    case "direct": return <ClipboardCheck className="w-3.5 h-3.5" />;
    default: return null;
  }
};

type EvaluationHistoryRecord = {
  id: string;
  date: string;
  score: number;
  rank: string;
  color: string;
  evaluatorType: EvaluatorType;
  inspector: string;
  channel: EvalChannel;
  requestId: string;
  criteria: any;
};

// Full historical evaluation records with different criteria details
const EVALUATION_HISTORY: EvaluationHistoryRecord[] = [
  {
    id: "EVAL-H1",
    date: "12 ม.ค. 2567",
    score: 94,
    rank: "A+",
    color: "green",
    evaluatorType: "admin",
    inspector: "เอกลักษณ์ ยอดเยี่ยม",
    channel: "direct",
    requestId: "REQ-2024-003",
    criteria: {
      hygiene: [
        { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: 5, note: "" },
        { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: 5, note: "" },
        { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: 4, note: "ตู้เย็นช่องที่ 2 สูงกว่าเกณฑ์ 1 องศา" },
        { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: 3, note: "จุดทิ้งขยะเปียกไม่ปิดสนิท" },
        { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: 5, note: "" },
      ],
      payment: [
        { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: 5, note: "", section: "หัวข้อ: ประวัติการชำระเงิน" },
        { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: 5, note: "" },
        { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: 5, note: "" },
      ],
      other: [
        { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: 5, note: "" },
        { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: 5, note: "" },
      ],
    }
  },
  {
    id: "EVAL-H2",
    date: "15 ธ.ค. 2566",
    score: 96,
    rank: "A+",
    color: "green",
    evaluatorType: "external",
    inspector: "ลูกค้า (สแกน QR Code)",
    channel: "qr",
    requestId: "REQ-2023-112",
    criteria: {
      hygiene: [
        { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: 5, note: "" },
        { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: 5, note: "" },
        { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: 5, note: "" },
        { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: 4, note: "ถังขยะไม่มีฝาปิดสนิทบริเวณด้านหลังร้าน" },
        { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: 5, note: "" },
      ],
      payment: [
        { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: 5, note: "", section: "หัวข้อ: ประวัติการชำระเงิน" },
        { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: 5, note: "" },
        { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: 5, note: "" },
      ],
      other: [
        { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: 5, note: "" },
        { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: 5, note: "" },
      ],
    }
  },
  {
    id: "EVAL-H3",
    date: "10 พ.ย. 2566",
    score: 92,
    rank: "A",
    color: "blue",
    evaluatorType: "staff",
    inspector: "สมชาย สายตรวจ",
    channel: "email",
    requestId: "REQ-2023-098",
    criteria: {
      hygiene: [
        { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: 4, note: "คราบน้ำมันเกาะบริเวณหน้าเตา" },
        { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: 5, note: "" },
        { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: 4, note: "วัตถุดิบวางบนพื้นไม่ได้วางบนชั้นยกสูง" },
        { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: 5, note: "" },
        { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: 5, note: "" },
      ],
      payment: [
        { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: 5, note: "", section: "หัวข้อ: ประวัติการชำระเงิน" },
        { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: 5, note: "" },
        { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: 4, note: "ค้างจ่ายใบเตือนค่าปรับ 2 วัน" },
      ],
      other: [
        { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: 5, note: "" },
        { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: 5, note: "" },
      ],
    }
  },
  {
    id: "EVAL-H4",
    date: "15 ต.ค. 2566",
    score: 88,
    rank: "A",
    color: "blue",
    evaluatorType: "admin",
    inspector: "เอกลักษณ์ ยอดเยี่ยม",
    channel: "direct",
    requestId: "REQ-2023-085",
    criteria: {
      hygiene: [
        { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: 4, note: "พบคราบฝุ่นบริเวณชั้นวางของ" },
        { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: 4, note: "พนักงานบริการไม่สวมหมวกคลุมผม" },
        { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: 4, note: "" },
        { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: 5, note: "" },
        { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: 5, note: "" },
      ],
      payment: [
        { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: 5, note: "", section: "หัวข้อ: ประวัติการชำระเงิน" },
        { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: 5, note: "" },
        { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: 5, note: "" },
      ],
      other: [
        { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: 4, note: "เปิดเพลงเสียงดังเกินเกณฑ์ที่กำหนดในบางเวลา" },
        { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: 5, note: "" },
      ],
    }
  },
  {
    id: "EVAL-H5",
    date: "05 ก.ย. 2566",
    score: 82,
    rank: "B",
    color: "orange",
    evaluatorType: "staff",
    inspector: "นิตยา มาลัย",
    channel: "qr",
    requestId: "REQ-2023-070",
    criteria: {
      hygiene: [
        { id: "h1", text: "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์", score: 3, note: "พบคราบคราบน้ำมันหนาแน่นและพื้นลื่นมาก" },
        { id: "h2", text: "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)", score: 4, note: "" },
        { id: "h3", text: "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี", score: 3, note: "เก็บของไม่เป็นระเบียบ ไม่มีป้ายระบุวันที่ผลิต" },
        { id: "h4", text: "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย", score: 4, note: "" },
        { id: "h5", text: "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน", score: 4, note: "พบแมลงวันบางจุดในร้าน" },
      ],
      payment: [
        { id: "p1", text: "6. ความตรงต่อเวลาในการชำระเงิน", score: 4, note: "ค้างจ่ายค่าเช่ารายเดือนเกินกำหนด 5 วัน", section: "หัวข้อ: ประวัติการชำระเงิน" },
        { id: "p2", text: "7. ความถูกต้องของเอกสารใบแจ้งหนี้", score: 5, note: "" },
        { id: "p3", text: "8. การบริหารจัดการยอดค้างชำระ", score: 5, note: "" },
      ],
      other: [
        { id: "o1", text: "9. การปฏิบัติตามกฎระเบียบของสถานที่", score: 5, note: "" },
        { id: "o2", text: "10. ความร่วมมือกับเจ้าหน้าที่ในการตรวจสอบ", score: 5, note: "" },
      ],
    }
  }
];

export function AdminEvalDetail() {
  const [selectedEval, setSelectedEval] = useState<EvaluationHistoryRecord>(EVALUATION_HISTORY[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const CRITERIA_DESCRIPTIONS: Record<string, string> = {
    h1: "การรักษาความสะอาดและสภาพพื้นที่ของสถานที่จัดเตรียมอาหารและอุปกรณ์ต่าง ๆ",
    h2: "ความเรียบร้อยและสุขอนามัยของผู้ให้บริการ เช่น การสวมผ้ากันเปื้อนและถุงมือ",
    h3: "ความถูกต้องเหมาะสมในการเก็บรักษาวัตถุดิบแต่ละประเภทตามมาตรฐาน",
    h4: "ระบบระบายน้ำทิ้งและการคัดแยกเศษอาหารขยะมูลฝอยอย่างเป็นระเบียบ",
    h5: "มาตรการป้องกันและควบคุมการแพร่ระบาดของแมลงหรือสัตว์พาหะ",
    p1: "ประวัติประพฤติการชำระเงินค่าส่วนต่างหรือค่าเช่าตามกรอบเวลาที่ตกลง",
    p2: "การจัดทำและยืนยันเอกสารรายงานการชำระหรือรายรับอย่างรอบคอบ",
    p3: "ประสิทธิภาพในการชดเชยและเคลียร์ยอดเงินค้างชำระตามข้อกำหนด",
    o1: "การปฏิบัติตามกฎระเบียบของสถานที่จัดสรรพื้นที่เช่าส่วนกลาง",
    o2: "ระดับความอำนวยความสะดวกและยินดีให้ความร่วมมือแก่เจ้าหน้าที่",
  };

  const enrichedCriteria = useMemo(() => {
    const enrichList = (list: any[]) =>
      (list || []).map(item => ({
        ...item,
        description: CRITERIA_DESCRIPTIONS[item.id] || ""
      }));

    return {
      hygiene: enrichList(selectedEval.criteria.hygiene),
      payment: enrichList(selectedEval.criteria.payment),
      other: enrichList(selectedEval.criteria.other),
    };
  }, [selectedEval]);

  const handleSelectHistory = (evalItem: EvaluationHistoryRecord) => {
    if (selectedEval.id === evalItem.id) return;
    setIsLoading(true);
    // Simulate dynamic data fetching API call
    setTimeout(() => {
      setSelectedEval(evalItem);
      setIsLoading(false);
    }, 500);
  };

  const visibleHistory = showAllHistory 
    ? EVALUATION_HISTORY 
    : EVALUATION_HISTORY.slice(0, 3); // Show latest 3 initially

  const currentBadge = getEvaluatorBadge(selectedEval.evaluatorType);
  const CurrentIcon = currentBadge.icon;

  return (
    <div className="max-w-[1400px] mx-auto px-6 mt-8">
      {/* Gallery / Visual Header */}
      <div className="grid grid-cols-4 gap-3 h-[400px] mb-8">
        <div className="col-span-2 relative overflow-hidden rounded-2xl group cursor-zoom-in">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            alt="Store View"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Inside" />
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1534422298391-e4f8c170dbbd?auto=format&fit=crop&q=80" className="w-full h-full object-cover bg-slate-200" alt="Counter" />
          </div>
        </div>
        <div className="col-span-1 relative overflow-hidden rounded-2xl">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Food" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button variant="secondary" className="bg-white/90 hover:bg-white">+ ดูรูปทั้งหมด</Button>
          </div>
        </div>
      </div>

      {/* Store Info Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">After You Dessert Cafe</h1>
            <Badge className={cn(
              "border-none px-3 py-1 font-medium hover:bg-opacity-90",
              selectedEval.color === "green" ? "bg-green-100 text-green-700 hover:bg-green-100" :
              selectedEval.color === "blue" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
              "bg-orange-100 text-orange-700 hover:bg-orange-100"
            )}>
              {selectedEval.rank} Grade
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-500">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-orange-500" /> Zone A, 2nd Floor, Unit A204
            </span>
            <span className="flex items-center gap-2">
              <Star className="size-4 text-orange-500 fill-orange-500" /> 4.8 / 5.0 (รีวิวจากส่วนกลาง)
            </span>
            <span className="flex items-center gap-2 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              <Calendar className="size-4 text-slate-500" /> ข้อมูลจากวันที่: {selectedEval.date}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-2xl">
            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">กำลังดึงข้อมูลประเมิน...</p>
            </div>
          </div>
        )}

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Audit Results Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full" />
                รายละเอียดการประเมินผล
              </h2>
            </div>

            <EvalAssessmentCriteria criteria={enrichedCriteria} readOnly={true} />
          </div>

          {/* History SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-400 rounded-full" />
                ประวัติการถูกประเมินย้อนหลังทั้งหมด
              </h2>
              {!showAllHistory && EVALUATION_HISTORY.length > 3 && (
                <Button 
                  variant="link" 
                  className="text-orange-600 font-bold p-0"
                  onClick={() => setShowAllHistory(true)}
                >
                  ดูทั้งหมด
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {visibleHistory.map((his) => {
                const badge = getEvaluatorBadge(his.evaluatorType);
                const Icon = badge.icon;
                
                return (
                  <Card 
                    key={his.id} 
                    onClick={() => handleSelectHistory(his)}
                    className={cn(
                      "shadow-none border transition-all duration-200 group cursor-pointer relative overflow-hidden",
                      selectedEval.id === his.id 
                        ? "border-orange-500 bg-orange-50/20 ring-1 ring-orange-500" 
                        : "border-slate-200 hover:border-orange-300 hover:bg-slate-50/50"
                    )}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                          selectedEval.id === his.id 
                            ? "bg-orange-500 text-white" 
                            : "bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500"
                        )}>
                          <History className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{his.date}</p>
                            <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", badge.color)}>
                              <Icon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium">{his.inspector}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {getChannelIcon(his.channel)} {his.channel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <Badge variant="outline" className="hidden sm:flex">{his.rank} Grade</Badge>
                        <div>
                          <p className={cn(
                            "text-xl font-black",
                            selectedEval.id === his.id ? "text-orange-600" : "text-slate-900"
                          )}>
                            {his.score}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Score Summary & Stats */}
        <div className="space-y-6">
          {/* Total Score Card */}
          <Card className="bg-black text-white border-none shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-orange-500" />
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">คะแนนรอบที่เลือก</span>
                </div>
                <div className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded">
                  {selectedEval.date}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-6xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                  {selectedEval.score}
                </div>
                <div>
                  <div className="text-xl font-bold flex items-center gap-1">
                    / 100 
                  </div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">
                    {selectedEval.score >= 94 ? "Excellent" : selectedEval.score >= 90 ? "Very Good" : "Good"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: `${selectedEval.score}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>Low</span>
                  <span>Target: 85%</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <div className="space-y-6 p-6 border rounded-2xl bg-white shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ภาพรวมคะแนนแยกหมวด</h3>
            <div className="space-y-5">
              {[
                { label: "โครงสร้างและพื้นฐาน", score: selectedEval.score >= 95 ? 100 : selectedEval.score >= 92 ? 95 : 90 },
                { label: "ความสะอาด", score: selectedEval.score >= 95 ? 95 : selectedEval.score >= 92 ? 85 : 78 },
                { label: "การจัดการขยะ", score: selectedEval.score >= 95 ? 90 : selectedEval.score >= 92 ? 80 : 70 },
                { label: "ความปลอดภัย", score: 100 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        item.score > 80 ? 'bg-green-500' : item.score > 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auditor Info (Updated) */}
          <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-5 relative overflow-hidden">
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              currentBadge.color.split(" ")[0]
            )} />
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ข้อมูลผู้ทำการตรวจสอบรอบนี้</h3>
            <div className="flex items-start gap-4">
              <div className={cn(
                "size-12 rounded-full flex items-center justify-center border shrink-0",
                currentBadge.color
              )}>
                 <CurrentIcon className="size-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-[15px] leading-tight">{selectedEval.inspector}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", currentBadge.color)}>
                    {currentBadge.label}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    {getChannelIcon(selectedEval.channel)} {selectedEval.channel}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 font-mono border border-slate-100">
              Request ID: {selectedEval.requestId}
            </div>

            <Button variant="outline" className="w-full text-xs font-bold py-5 mt-2">
               <InfoIcon className="size-4 mr-2 text-slate-400" /> ดูบันทึกฉบับเต็ม
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
