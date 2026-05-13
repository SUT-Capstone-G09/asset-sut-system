import { Image as ImageIcon, FileText, UploadCloud, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function NewsUploads() {
  return (
    <div className="grid grid-cols-2 gap-6 pb-4">
      {/* ภาพหลัก */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 transition-colors rounded items-center justify-center py-10 flex flex-col gap-3 cursor-pointer bg-white">
            <ImageIcon className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
            <div className="text-sm font-bold text-zinc-800">อัปโหลดรูปภาพหลัก (JPG, PNG)</div>
            <div className="text-xs text-zinc-500">ลากและวางไฟล์ที่นี่ หรือ คลิกเพื่อเลือก</div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>อัปโหลดรูปภาพหลัก</DialogTitle>
            <DialogDescription>
              รองรับไฟล์ .JPG, .PNG ขนาดไม่เกิน 5MB
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
            <UploadCloud className="w-12 h-12 text-zinc-400 mb-4" />
            <p className="text-sm font-medium text-zinc-700">คลิก หรือ ลากไฟล์มาวางที่นี่</p>
            <input type="file" className="hidden" accept=".jpg,.jpeg,.png" />
          </label>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" className="border-zinc-300">ยกเลิก</Button>
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">อัปโหลดรูปภาพ</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* ไฟล์ PDF */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="border-2 border-dashed border-zinc-300 hover:border-brand-primary/50 transition-colors rounded items-center justify-center py-10 flex flex-col gap-3 cursor-pointer bg-white">
            <FileText className="w-10 h-10 text-zinc-400" strokeWidth={1.5} />
            <div className="text-sm font-bold text-zinc-800">อัปโหลดประกาศฉบับเต็ม (PDF)</div>
            <div className="text-xs text-zinc-500">รองรับไฟล์ขนาดไม่เกิน 10MB</div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>อัปโหลดเอกสารประกาศ</DialogTitle>
            <DialogDescription>
              รองรับไฟล์ .PDF ขนาดไม่เกิน 10MB
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
            <UploadCloud className="w-12 h-12 text-zinc-400 mb-4" />
            <p className="text-sm font-medium text-zinc-700">คลิก หรือ ลากเอกสาร PDF มาวางที่นี่</p>
            <input type="file" className="hidden" accept=".pdf" />
          </label>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" className="border-zinc-300">ยกเลิก</Button>
            <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">อัปโหลดเอกสาร</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
