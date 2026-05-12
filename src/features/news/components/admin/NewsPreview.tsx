import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

export function NewsPreview() {
  return (
    <div className="mt-16 pt-8 border-t-4 border-brand-primary">
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
        <Eye className="w-7 h-7 text-brand-primary" strokeWidth={2.5} /> 
        ตัวอย่างหน้าประกาศ (Preview)
      </h2>
      
      <div className="border border-zinc-200 rounded p-8 bg-zinc-50 min-h-[300px]">
        <div className="flex gap-4 items-center text-sm text-zinc-500 mb-6">
          <Badge className="bg-[#b18342] hover:bg-[#966b31] text-white px-3 py-0.5 rounded-sm">พื้นที่เช่าร้านอาหาร</Badge>
          <span>เผยแพร่เมื่อ: 14 ตุลาคม 2567</span>
        </div>
        <div className="h-64 bg-zinc-200/60 rounded flex items-center justify-center text-zinc-400 border border-zinc-300 border-dashed">
          [ พื้นที่แสดงตัวอย่างเนื้อหา / รูปภาพ ]
        </div>
      </div>
    </div>
  )
}
