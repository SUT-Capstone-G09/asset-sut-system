import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { InfoIcon, ClipboardCheckIcon, MessageSquareQuoteIcon, CheckCircle2 } from "lucide-react"

export default function EvaluationFormPage() {
  const ratingLabels = ["1", "2", "3", "4", "5"]

  return (
    <div className="flex flex-col gap-6 p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/(commercial)/tenants">ผู้ประกอบการ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>แบบฟอร์มบันทึกการประเมิน</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-xs font-bold tracking-wider uppercase">
          Status: Drafting
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Store Information - Now Full Width */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <InfoIcon className="size-5 text-orange-500" />
            <CardTitle className="text-lg">ข้อมูลทั่วไปของร้านค้า (STORE INFORMATION)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">ชื่อร้านค้า (STORE NAME)</Label>
              <Input id="store-name" placeholder="ระบุชื่อร้านค้า" className="focus-visible:ring-orange-500/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">สถานที่ (LOCATION)</Label>
              <Select>
                <SelectTrigger id="location">
                  <SelectValue placeholder="เลือกสถานที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canteen-1">ศูนย์อาหารอาคารกลาง</SelectItem>
                  <SelectItem value="canteen-2">ศูนย์อาหารอาคารเรียนรวม 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">วันที่ประเมิน (DATE OF INSPECTION)</Label>
              <Input id="date" type="date" className="w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area: Criteria */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section 2: Hygiene Checklist with Rating Scale */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <ClipboardCheckIcon className="size-5 text-orange-500" />
                <CardTitle className="text-lg">เกณฑ์การประเมินสุขาภิบาล (HYGIENE CHECKLIST)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4 flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                  <span>รายละเอียดเกณฑ์การประเมิน</span>
                  <span className="tracking-widest">1 - 5</span>
                </div>

                <div className="space-y-0">
                  {[
                    "1. ความสะอาดของสถานที่ประกอบอาหารและอุปกรณ์",
                    "2. การแต่งกายและสุขอนามัยของผู้สัมผัสอาหาร (ถุงมือ/ผ้ากันเปื้อน)",
                    "3. การเก็บรักษาวัตถุดิบอาหารสดและแห้งอย่างถูกวิธี",
                    "4. การกำจัดขยะ เศษอาหาร และระบบระบายน้ำเสีย",
                    "5. การควบคุมสัตว์และแมลงพาหะนำโรคในบริเวณร้าน"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-6 border-b border-slate-100 py-5 last:border-b-0">
                      <p className="text-sm font-medium text-slate-700 leading-6">{item}</p>

                      <div className="flex shrink-0 gap-2">
                        {ratingLabels.map((rating) => (
                          <label key={rating} className="cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              value={rating}
                              className="peer sr-only"
                            />
                            <span className="flex size-9 items-center justify-center rounded-full border border-slate-300 text-sm font-medium text-slate-700 transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-checked:text-white hover:border-orange-400">
                              {rating}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-700">
                    <span className="font-bold">หมายเหตุ:</span> ให้คะแนนตามระดับความสำคัญ โดย 1 = ต่ำมาก, 5 = สูงมาก
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Sidebar Actions & Notes */}
          <div className="space-y-6 lg:col-span-1">
            {/* Section 3: Notes (Moved Here, next to Criteria) */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <MessageSquareQuoteIcon className="size-5 text-orange-500" />
                <CardTitle className="text-lg">หมายเหตุเพิ่มเติม</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  className="min-h-[225px] focus-visible:ring-orange-500/50"
                />
              </CardContent>
            </Card>

            {/* Progress Widget */}
            <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Inspection Progress</p>
                <h3 className="text-4xl font-black italic">0/5</h3>
              </div>
              <CheckCircle2 className="absolute -right-4 -bottom-4 size-32 text-white/10" />
            </div>

            {/* Action Buttons */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col gap-3 pt-6">
                <Button className="w-full bg-black hover:bg-slate-800 text-white font-bold h-12">
                  บันทึกการประเมิน
                </Button>
                <Button variant="outline" className="w-full border-slate-200 hover:bg-white h-12">
                  ยกเลิก
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}