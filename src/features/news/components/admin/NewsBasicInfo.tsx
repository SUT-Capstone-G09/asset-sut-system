import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewsBasicInfo() {
  return (
    <>
      {/* หัวข้อประกาศ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">หัวข้อประกาศ</Label>
        <Input 
          className="border-zinc-300"
          placeholder="เช่น รับสมัครคัดเลือกผู้ประกอบการจำหน่ายอาหาร ประจำปี 2567" 
        />
      </div>

      {/* หมวดหมู่ประกาศ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">หมวดหมู่ประกาศ</Label>
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-[300px] border-zinc-300">
              <SelectValue placeholder="พื้นที่เช่าร้านอาหาร" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">พื้นที่เช่าร้านอาหาร</SelectItem>
              <SelectItem value="retail">พื้นที่ร้านค้าปลีก</SelectItem>
              <SelectItem value="office">สำนักงาน</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="bg-[#b18342] hover:bg-[#966b31] text-white px-4 py-1">New Post</Badge>
          <Badge variant="secondary" className="bg-zinc-200 text-zinc-700 hover:bg-zinc-300 px-4 py-1">Public Desk</Badge>
        </div>
      </div>

      {/* รายละเอียดคุณสมบัติผู้สมัคร */}
      <div className="space-y-3">
        <Label className="text-base font-bold">รายละเอียดคุณสมบัติผู้สมัคร (รายการละบรรทัด)</Label>
        <Textarea 
          className="min-h-[140px] border-zinc-300 resize-none" 
          placeholder="- มีสัญชาติไทย&#10;- มีประสบการณ์ด้านโภชนาการไม่น้อยกว่า 3 ปี&#10;- ไม่เคยถูกเลิกจ้างด้วยความผิดวินัย" 
        />
      </div>

      {/* รายการเอกสารที่ต้องใช้ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">รายการเอกสารที่ต้องใช้ (รายการละบรรทัด)</Label>
        <Textarea 
          className="min-h-[140px] border-zinc-300 resize-none" 
          placeholder="- สำเนาบัตรประชาชน&#10;- ทะเบียนบ้าน&#10;- หนังสือรับรองการจดทะเบียนนิติบุคคล&#10;- แผนผังการจัดร้านเบื้องต้น" 
        />
      </div>
    </>
  )
}
