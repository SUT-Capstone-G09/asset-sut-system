import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NewsContractInfo() {
  return (
    <div className="bg-zinc-50 border border-zinc-100 p-8 rounded">
      <h3 className="text-lg font-bold border-b-2 border-brand-primary/40 pb-3 mb-6 flex items-center gap-2">
        ข้อมูลสัญญาและพื้นที่
      </h3>
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-2">
          <Label className="font-bold text-sm">ระยะเวลาสัญญา (ปี)</Label>
          <Input type="number" min="0" placeholder="0" className="border-zinc-300" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-sm">ขนาดพื้นที่ (ตร.ม.)</Label>
          <Input type="number" min="0" placeholder="0" className="border-zinc-300" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-sm">ค่าธรรมเนียมแรกเข้า (บาท)</Label>
          <Input type="number" min="0" placeholder="0" className="border-zinc-300" />
        </div>
      </div>
    </div>
  )
}
