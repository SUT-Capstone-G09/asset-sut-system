"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { NewsBasicInfo } from "@/features/news/components/admin/form/NewsBasicInfo";
import { NewsQualificationsInfo } from "@/features/news/components/admin/form/NewsQualificationsInfo";
import { NewsContractInfo } from "@/features/news/components/admin/form/NewsContractInfo";
import { NewsUploads } from "@/features/news/components/admin/form/NewsUploads";
import { NewsPreview } from "@/features/news/components/admin/preview/NewsPreview";
import { MOCK_NEWS } from "@/features/news/data/mocknews";

export default function NewsEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const newsItem = MOCK_NEWS.find((item) => item.id === id);

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    referenceId: string;
    selectedAsset: string;
    scheduleEnabled: boolean;
    isFeatured: boolean;
    startDate: string;
    endDate: string;
    resultTimeline: string;
    qualifications: { id: string; text: string }[];
    documents: { id: string; name: string; isPreset: boolean; checked?: boolean }[];
    contractDuration: string;
    areaSize: string;
    entranceFee: string;
    mainImagePreview: string | null;
    mainImageName: string | null;
    mainImageSize: number | null;
    attachedFiles: { file: File; id: string }[];
  }>({
    title: "",
    category: "ร้านค้า",
    referenceId: "",
    selectedAsset: "asset-001",
    scheduleEnabled: true,
    isFeatured: false,
    startDate: "2026-07-12",
    endDate: "2026-08-12",
    resultTimeline: "รายละเอียดโครงการคัดเลือกและกำหนดการเช่าพื้นที่เชิงพาณิชย์ มหาวิทยาลัยเทคโนโลยีสุรนารี",
    qualifications: [
      { id: "q1", text: "มีสัญชาติไทย" },
      { id: "q2", text: "มีประสบการณ์ในการประกอบกิจการร้านค้า/ร้านอาหารอย่างน้อย 2 ปี" }
    ],
    documents: [
      { id: "id-card", name: "สำเนาบัตรประชาชน", isPreset: true, checked: true },
      { id: "house-reg", name: "ทะเบียนบ้าน", isPreset: true, checked: true }
    ],
    contractDuration: "3",
    areaSize: "45",
    entranceFee: "10000",
    mainImagePreview: null,
    mainImageName: "cover_image.jpg",
    mainImageSize: 1048576,
    attachedFiles: [],
  });

  useEffect(() => {
    if (newsItem) {
      setFormData((prev) => ({
        ...prev,
        title: newsItem.title || prev.title,
        category: newsItem.category || prev.category,
        referenceId: newsItem.id || prev.referenceId,
        mainImagePreview: newsItem.imageUrl || prev.mainImagePreview,
      }));
    }
  }, [newsItem]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert("บันทึกการแก้ไขเรียบร้อยแล้ว!");
    router.push("/admin/news-management");
  };

  if (!newsItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-bold text-zinc-800">ไม่พบประกาศข่าวสารที่ต้องการแก้ไข</h2>
        <Button onClick={() => router.push("/admin/news-management")} className="bg-brand-primary hover:bg-brand-primary/95 text-white">
          กลับสู่หน้ารายการข่าว
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-8">
      {/* Header section with back button */}
      <div className="flex items-center gap-3 border-b pb-5">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push("/admin/news-management")}
          className="rounded-xl border-zinc-200"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">แก้ไขข้อมูลประกาศข่าวสาร</h1>
          <p className="text-xs text-zinc-500">แก้ไขรายละเอียดของประกาศ: {formData.title || id}</p>
        </div>
      </div>

      <div className="space-y-8">
        <NewsBasicInfo data={formData} onChange={handleChange} />
        
        <NewsQualificationsInfo
          qualifications={formData.qualifications}
          documents={formData.documents}
          onChange={handleChange}
        />
        
        <NewsContractInfo data={formData} onChange={handleChange} />
        
        <NewsUploads
          mainImagePreview={formData.mainImagePreview}
          mainImageName={formData.mainImageName}
          mainImageSize={formData.mainImageSize}
          attachedFiles={formData.attachedFiles}
          onChange={handleChange}
        />

        {/* Action Buttons */}
        <div className="border-t-2 border-brand-secondary/20 pt-6 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/news-management")}
            className="w-32 border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary/10 font-bold"
          >
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSave}
            className="w-44 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold"
          >
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>

      {/* Real-time Preview */}
      <NewsPreview data={formData} />
    </div>
  );
}
