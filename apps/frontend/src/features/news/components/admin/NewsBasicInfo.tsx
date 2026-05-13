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

interface NewsBasicInfoProps {
  data: {
    title: string;
    category: string;
    details: string;
    qualifications: string;
    documents: string;
  };
  onChange: (field: string, value: string) => void;
}

export function NewsBasicInfo({ data, onChange }: NewsBasicInfoProps) {
  return (
    <>
      {/* หัวข้อประกาศ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">หัวข้อประกาศ</Label>
        <Input 
          className="border-zinc-300"
          placeholder="เช่น รับสมัครคัดเลือกผู้ประกอบการจำหน่ายอาหาร ประจำปี 2567" 
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>

      {/* หมวดหมู่ประกาศ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">หมวดหมู่ประกาศ</Label>
        <div className="flex items-center gap-4">
          <Select value={data.category} onValueChange={(val) => onChange("category", val)}>
            <SelectTrigger className="w-[300px] border-zinc-300">
              <SelectValue placeholder="พื้นที่เช่าร้านอาหาร" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="พื้นที่เช่าร้านอาหาร">พื้นที่เช่าร้านอาหาร</SelectItem>
              <SelectItem value="พื้นที่ร้านค้าปลีก">พื้นที่ร้านค้าปลีก</SelectItem>
              <SelectItem value="สำนักงาน">สำนักงาน</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-1 cursor-pointer">New Post</Badge>
          <Badge variant="secondary" className="bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 px-4 py-1 cursor-pointer">Public Desk</Badge>
        </div>
      </div>

      {/* รายละเอียดประกาศ / รายละเอียดย่อ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">รายละเอียดโดยย่อ (สำหรับแสดงหน้าปก)</Label>
        <Textarea 
          className="min-h-[140px] border-zinc-300 resize-none" 
          placeholder="ติดตามประกาศสำคัญ ข่าวประชาสัมพันธ์..." 
          value={data.details}
          onChange={(e) => onChange("details", e.target.value)}
        />
      </div>

      {/* รายละเอียดคุณสมบัติผู้สมัคร */}
      <div className="space-y-3">
        <Label className="text-base font-bold">รายละเอียดคุณสมบัติผู้สมัคร (รายการละบรรทัด)</Label>
        <Textarea 
          className="min-h-[140px] border-zinc-300 resize-none" 
          placeholder="- มีสัญชาติไทย&#10;- มีประสบการณ์ด้านโภชนาการไม่น้อยกว่า 3 ปี&#10;- ไม่เคยถูกเลิกจ้างด้วยความผิดวินัย" 
          value={data.qualifications}
          onChange={(e) => onChange("qualifications", e.target.value)}
        />
      </div>

      {/* รายการเอกสารที่ต้องใช้ */}
      <div className="space-y-3">
        <Label className="text-base font-bold">รายการเอกสารที่ต้องใช้ (รายการละบรรทัด)</Label>
        <Textarea 
          className="min-h-[140px] border-zinc-300 resize-none" 
          placeholder="- สำเนาบัตรประชาชน&#10;- ทะเบียนบ้าน&#10;- หนังสือรับรองการจดทะเบียนนิติบุคคล&#10;- แผนผังการจัดร้านเบื้องต้น" 
          value={data.documents}
          onChange={(e) => onChange("documents", e.target.value)}
        />
      </div>
    </>
  )
}
