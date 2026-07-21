"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoIcon, MessageSquareQuoteIcon, CheckCircle2, CalendarIcon } from "lucide-react"
import { EvalAssessmentCriteria } from "@/features/evaluations/components/records/EvalAssessmentCriteria"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// ข้อมูลจำลองร้านค้าแยกตามสถานที่
const STORES_BY_LOCATION: Record<string, { id: string; name: string }[]> = {
  "canteen-1": [
    { id: "store-101", name: "ร้านส้มตำแซ่บ" },
    { id: "store-102", name: "ก๋วยเตี๋ยวเรืออยุธยา" },
    { id: "store-103", name: "ร้านข้าวมันไก่สิงคโปร์" },
  ],
  "canteen-2": [
    { id: "store-201", name: "After You Dessert Cafe" },
    { id: "store-202", name: "ร้านกาแฟคาเฟ่อเมซอน" },
    { id: "store-203", name: "ร้านข้าวแกงปักษ์ใต้" },
  ],
}

export function AdminEvalForm() {
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [date, setDate] = useState<Date | undefined>(new Date())

  // หาร้านค้าทั้งหมดแบบแบน (Flat List)
  const allStores = Object.entries(STORES_BY_LOCATION).flatMap(([locId, stores]) =>
    stores.map(s => ({ ...s, locationId: locId }))
  )

  // ถ้าระบุสถานที่ ให้กรองเฉพาะร้านในสถานที่นั้น ถ้าไม่ระบุ ให้แสดงทุกร้าน
  const availableStores = selectedLocation
    ? STORES_BY_LOCATION[selectedLocation] || []
    : allStores

  const handleLocationChange = (val: string) => {
    setSelectedLocation(val)
    
    // ตรวจสอบว่าร้านค้าเดิมที่เลือก อยู่ในสถานที่ใหม่ที่เลือกหรือไม่ ถ้าไม่อยู่ให้รีเซ็ต
    if (val) {
      const isStoreInNewLoc = STORES_BY_LOCATION[val]?.some(s => s.id === selectedStore)
      if (!isStoreInNewLoc) {
        setSelectedStore("")
      }
    }
  }

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    
    // ค้นหาสถานที่ของร้านค้านี้ และกรอกสถานที่ให้อัตโนมัติ
    const store = allStores.find(s => s.id === storeId)
    if (store && store.locationId) {
      setSelectedLocation(store.locationId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Store Information - Now Full Width */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <InfoIcon className="size-5 text-orange-500" />
          <CardTitle className="text-lg">ข้อมูลทั่วไปของร้านค้า</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="location">สถานที่</Label>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger id="location">
                <SelectValue placeholder="เลือกสถานที่ (ทั้งหมด)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canteen-1">ศูนย์อาหารอาคารกลาง</SelectItem>
                <SelectItem value="canteen-2">ศูนย์อาหารอาคารเรียนรวม 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-name">ชื่อร้านค้า</Label>
            <Select
              value={selectedStore}
              onValueChange={handleStoreChange}
            >
              <SelectTrigger id="store-name">
                <SelectValue placeholder="เลือกชื่อร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label htmlFor="date" className="mb-1">วันที่ประเมิน</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-100 border-none rounded-[7px] h-10 hover:bg-slate-200/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                  {date ? (
                    `${format(date, "dd/MM")}/${date.getFullYear() + 543}`
                  ) : (
                    <span>เลือกวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={th}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area: Criteria */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section 2: Assessment Criteria */}
          <EvalAssessmentCriteria />
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
                className="min-h-[225px] focus-visible:ring-orange-500/50 bg-slate-100 border-none rounded-[7px]"
              />
            </CardContent>
          </Card>

          {/* Progress Widget */}
          <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white shadow-lg">
            <div className="relative z-10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">ความคืบหน้าการตรวจ</p>
              <h3 className="text-4xl font-black italic">0/5</h3>
            </div>
            <CheckCircle2 className="absolute -right-4 -bottom-4 size-32 text-white/10" />
          </div>

          {/* Action Buttons */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-slate-50/50">
            <CardContent className="flex flex-col gap-3 pt-6">
              <Button className="w-full font-bold h-12">
                บันทึกการประเมิน
              </Button>
              <Button variant="secondary" className="w-full h-12">
                ยกเลิก
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
