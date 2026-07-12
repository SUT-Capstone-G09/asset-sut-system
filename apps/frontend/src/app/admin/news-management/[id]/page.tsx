"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_NEWS } from "@/features/news/data/mocknews";
import { NewsPreview } from "@/features/news/components/admin/preview/NewsPreview";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const newsItem = MOCK_NEWS.find((item) => item.id === id);

  if (!newsItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-bold text-zinc-800">ไม่พบประกาศข่าวสารที่ต้องการ</h2>
        <Button onClick={() => router.push("/admin/news-management")} className="bg-brand-primary hover:bg-brand-primary/95 text-white">
          กลับสู่หน้ารายการข่าว
        </Button>
      </div>
    );
  }

  // สร้างข้อมูลจำลองแบบละเอียดสำหรับใช้ใน Preview
  const previewData = {
    title: newsItem.title,
    category: newsItem.category,
    resultTimeline: "กำหนดการคัดเลือกผู้เช่าพื้นที่และขั้นตอนการเสนอคุณสมบัติ จะประกาศผลทางระบบบริหารจัดการทรัพย์สิน และบอร์ดประชาสัมพันธ์ ณ มหาวิทยาลัยเทคโนโลยีสุรนารี เอกสารและระเบียบการจัดทำโดยละเอียดแนบอยู่ท้ายประกาศฉบับนี้",
    qualifications: [
      { id: "q1", text: "มีสัญชาติไทย" },
      { id: "q2", text: "มีประสบการณ์การประกอบกิจการด้านร้านค้า/ร้านอาหารอย่างน้อย 2 ปี" },
      { id: "q3", text: "ไม่เป็นบุคคลล้มละลายหรือถูกบอกเลิกสัญญาเช่าเดิมกับทางมหาวิทยาลัย" }
    ],
    documents: [
      { id: "id-card", name: "สำเนาบัตรประชาชน", isPreset: true, checked: true },
      { id: "house-reg", name: "ทะเบียนบ้าน", isPreset: true, checked: true },
      { id: "cert", name: "หนังสือจดทะเบียนทางการค้า (หากมี)", isPreset: false, checked: true }
    ],
    contractDuration: "3",
    areaSize: "45",
    entranceFee: "10000",
    mainImagePreview: newsItem.imageUrl,
    attachedFiles: [
      { 
        file: new File([""], "ระเบียบการเช่าพื้นที่และเงื่อนไขการสมัคร.pdf", { type: "application/pdf" }), 
        id: "pdf-doc-1" 
      }
    ]
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header section with actions */}
      <div className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/admin/news-management")}
            className="rounded-xl border-zinc-200"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">รายละเอียดและตัวอย่างหน้าประกาศ</h1>
            <p className="text-xs text-zinc-500">รหัสอ้างอิง: {id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/admin/news-management/${id}/edit`}>
            <Button className="bg-[#C2410C] hover:bg-[#9a330a] text-white font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl">
              <Pencil className="w-4 h-4" />
              แก้ไขประกาศนี้
            </Button>
          </Link>
        </div>
      </div>

      {/* Embedded Preview Component */}
      <div className="bg-slate-50/50 rounded-3xl p-6 border border-zinc-100">
        <NewsPreview data={previewData} />
      </div>
    </div>
  );
}
