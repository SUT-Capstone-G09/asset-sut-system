"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { NewsCreateHeader } from "@/features/news/components/admin/layout/NewsCreateHeader"
import { NewsBasicInfo } from "@/features/news/components/admin/form/NewsBasicInfo"
import { NewsQualificationsInfo } from "@/features/news/components/admin/form/NewsQualificationsInfo"
import { NewsContractInfo } from "@/features/news/components/admin/form/NewsContractInfo"
import { NewsUploads } from "@/features/news/components/admin/form/NewsUploads"
import { NewsPreview } from "@/features/news/components/admin/preview/NewsPreview"

export default function NewsManagementPage() {
  const [formData, setFormData] = useState<{
    title: string
    category: string
    referenceId: string
    selectedAsset: string
    scheduleEnabled: boolean
    isFeatured: boolean
    startDate: string
    endDate: string
    resultTimeline: string
    qualifications: { id: string; text: string }[]
    documents: { id: string; name: string; isPreset: boolean; checked?: boolean }[]
    contractDuration: string
    areaSize: string
    entranceFee: string
    mainImagePreview: string | null
    mainImageName: string | null
    mainImageSize: number | null
    attachedFiles: { file: File; id: string }[]
  }>({
    title: "",
    category: "shop-rental",
    referenceId: "",
    selectedAsset: "",
    scheduleEnabled: true,
    isFeatured: false,
    startDate: "",
    endDate: "",
    resultTimeline: "",
    qualifications: [
      { id: "q1", text: "ระบุคุณสมบัติ เช่น มีสัญชาติไทย" },
      { id: "q2", text: "ระบุประสบการณ์ เช่น มีประสบการณ์ด้านโภชนาการไม่น้อยกว่า 3 ปี" },
    ],
    documents: [
      { id: "id-card", name: "สำเนาบัตรประชาชน", isPreset: true, checked: true },
      { id: "house-reg", name: "ทะเบียนบ้าน", isPreset: true, checked: true },
      { id: "company-cert-extra", name: "หนังสือรับรองบริษัท (กรณี)", isPreset: false },
    ],
    contractDuration: "",
    areaSize: "",
    entranceFee: "",
    mainImagePreview: null,
    mainImageName: null,
    mainImageSize: null,
    attachedFiles: [],
  })

  const router = useRouter()

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = () => {
    toast.success("บันทึกแบบร่างเรียบร้อยแล้ว!")
    router.push("/admin/news-management")
  }

  const handleCreate = () => {
    toast.success("สร้างประกาศเรียบร้อยแล้ว!")
    router.push("/admin/news-management")
  }

  return (
    <div className="space-y-10 p-8">
      <NewsCreateHeader />
      
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
            variant="secondary" 
            onClick={handleSaveDraft}
            className="w-32 font-bold"
          >
            บันทึกร่าง
          </Button>
          <Button 
            variant="default"
            onClick={handleCreate}
            className="w-44 font-bold text-white"
          >
            ยืนยันสร้างประกาศ
          </Button>
        </div>
      </div>

      <NewsPreview data={formData} />
    </div>
  )
}