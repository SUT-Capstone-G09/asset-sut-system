"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NewsCreateHeader } from "@/features/news/components/admin/NewsCreateHeader"
import { NewsBasicInfo } from "@/features/news/components/admin/NewsBasicInfo"
import { NewsContractInfo } from "@/features/news/components/admin/NewsContractInfo"
import { NewsUploads } from "@/features/news/components/admin/NewsUploads"
import { NewsPreview } from "@/features/news/components/admin/NewsPreview"

export default function NewsManagementPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "พื้นที่เช่าร้านอาหาร",
    details: "",
    qualifications: "",
    documents: "",
    contractDuration: "",
    areaSize: "",
    entranceFee: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-10 p-8">
      <NewsCreateHeader />
      
      <div className="space-y-8">
        <NewsBasicInfo data={formData} onChange={handleChange} />
        <NewsContractInfo data={formData} onChange={handleChange} />
        <NewsUploads />

        {/* Action Buttons */}
        <div className="border-t-2 border-brand-secondary/20 pt-6 flex justify-end gap-3">
          <Button variant="outline" className="w-32 border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary/10 font-bold">บันทึกร่าง</Button>
          <Button className="w-44 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold">ยืนยันสร้างประกาศ</Button>
        </div>
      </div>

      <NewsPreview data={formData} />
    </div>
  )
}