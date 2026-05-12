import { Button } from "@/components/ui/button"
import { NewsManagementHeader } from "@/features/news/components/admin/NewsManagementHeader"
import { NewsBasicInfo } from "@/features/news/components/admin/NewsBasicInfo"
import { NewsContractInfo } from "@/features/news/components/admin/NewsContractInfo"
import { NewsUploads } from "@/features/news/components/admin/NewsUploads"
import { NewsPreview } from "@/features/news/components/admin/NewsPreview"

export default function NewsManagementPage() {
  return (
    <div className="space-y-10 p-8">
      <NewsManagementHeader />
      
      <div className="space-y-8">
        <NewsBasicInfo />
        <NewsContractInfo />
        <NewsUploads />

        {/* Action Buttons */}
        <div className="border-t-2 border-zinc-900 pt-6 flex justify-end gap-3">
          <Button variant="outline" className="w-32 border-zinc-300 font-bold">บันทึกร่าง</Button>
          <Button className="w-44 bg-zinc-900 hover:bg-zinc-800 text-white font-bold">ยืนยันสร้างประกาศ</Button>
        </div>
      </div>

      <NewsPreview />
    </div>
  )
}