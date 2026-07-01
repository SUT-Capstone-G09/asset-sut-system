import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewsContractInfoProps {
  data: {
    contractDuration: string;
    areaSize: string;
    entranceFee: string;
  };
  onChange: (field: string, value: string) => void;
}

export function NewsContractInfo({ data, onChange }: NewsContractInfoProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 p-8 rounded">
      <h3 className="text-lg font-bold border-b-2 border-brand-primary/40 pb-3 mb-6 flex items-center gap-2">
        ข้อมูลสัญญาและพื้นที่
      </h3>
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-2">
          <Label className="font-bold text-sm">ระยะเวลาสัญญา (ปี)</Label>
          <Input
            type="text"
            placeholder="เช่น 1"
            className="border-zinc-300"
            value={data.contractDuration}
            onChange={(e) => onChange("contractDuration", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-sm">ขนาดพื้นที่ (ตร.ม.)</Label>
          <Input
            type="text"
            placeholder="เช่น 15-25"
            className="border-zinc-300"
            value={data.areaSize}
            onChange={(e) => onChange("areaSize", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-sm">ค่าธรรมเนียมแรกเข้า (บาท)</Label>
          <Input
            type="text"
            placeholder="เช่น ตามระเบียบมหาลัย"
            className="border-zinc-300"
            value={data.entranceFee}
            onChange={(e) => onChange("entranceFee", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
