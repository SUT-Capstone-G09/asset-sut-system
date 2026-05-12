import { Image as ImageIcon, FileText } from "lucide-react"

export function NewsUploads() {
  return (
    <div className="grid grid-cols-2 gap-6 pb-4">
      <div className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 transition-colors rounded items-center justify-center py-10 flex flex-col gap-3 cursor-pointer bg-white">
        <ImageIcon className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
        <div className="text-sm font-bold text-zinc-800">อัปโหลดรูปภาพหลัก (JPG, PNG)</div>
        <div className="text-xs text-zinc-500">ลากและวางไฟล์ที่นี่ หรือ คลิกเพื่อเลือก</div>
      </div>
      
      <div className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 transition-colors rounded items-center justify-center py-10 flex flex-col gap-3 cursor-pointer bg-white">
        <FileText className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
        <div className="text-sm font-bold text-zinc-800">อัปโหลดประกาศฉบับเต็ม (PDF)</div>
        <div className="text-xs text-zinc-500">รองรับไฟล์ขนาดไม่เกิน 10MB</div>
      </div>
    </div>
  )
}
