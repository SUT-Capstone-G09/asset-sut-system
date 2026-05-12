"use client"

import React from "react"
import { 
  MapPin, 
  Star, 
  History, 
  AlertCircle, 
  Info as InfoIcon, 
  Download, 
  Printer, 
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default function TenantEvaluationDetailPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header & Navigation */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/dashboard">แดชบอร์ด</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/tenants/lists">จัดการผู้เช่า</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>รายละเอียดการประเมิน</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="size-4" /> Print
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
              <ExternalLink className="size-4" /> ดูสัญญา
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        {/* Gallery / Visual Header */}
        <div className="grid grid-cols-4 gap-3 h-[400px] mb-8">
          <div className="col-span-2 relative overflow-hidden rounded-2xl group cursor-zoom-in">
            <img 
              src="https://www.bkkmenu.com/eat/stories/9-unique-cafes-to-sip-in-style.html" 
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              alt="Store View"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Inside" />
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <img src="https://images.unsplash.com/photo-1534422298391-e4f8c170dbbd?auto=format&fit=crop&q=80" className="w-full h-full object-cover bg-slate-200" alt="Counter" />
            </div>
          </div>
          <div className="col-span-1 relative overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Food" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button variant="secondary" className="bg-white/90 hover:bg-white">+ ดูรูปทั้งหมด</Button>
            </div>
          </div>
        </div>

        {/* Store Info Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">After You Dessert Cafe</h1>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 font-medium">A+ Grade</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-orange-500" /> Zone A, 2nd Floor, Unit A204
              </span>
              <span className="flex items-center gap-2">
                <Star className="size-4 text-orange-500 fill-orange-500" /> 4.8 / 5.0 (รีวิวจากส่วนกลาง)
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="size-4 text-orange-500" /> ตรวจสอบล่าสุดเมื่อ: 12 ม.ค. 2024
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Audit Results Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full" />
                  รายการตรวจสอบประเมินผล (Latest Audit)
                </h2>
                <span className="text-sm text-slate-500">ทั้งหมด 6 รายการ</span>
              </div>

              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[350px]">รายการตรวจสอบ</TableHead>
                      <TableHead className="text-center">คะแนน</TableHead>
                      <TableHead className="text-center">สถานะ</TableHead>
                      <TableHead className="text-right">หมายเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { item: "ความสะอาดพื้นผิวและอุปกรณ์ประกอบอาหาร", score: 10, max: 10, status: "Pass", note: "" },
                      { item: "การจัดเก็บวัตถุดิบและอุณหภูมิที่เหมาะสม", score: 9, max: 10, status: "Pass", note: "ตู้เย็นช่องที่ 2 สูงกว่าเกณฑ์ 1 องศา" },
                      { item: "การแต่งกายและสุขวิทยาส่วนบุคคล", score: 10, max: 10, status: "Pass", note: "" },
                      { item: "การกำจัดขยะและเศษอาหาร", score: 8, max: 10, status: "Improvement", note: "จุดทิ้งขยะเปียกไม่ปิดสนิท" },
                      { item: "ป้ายราคาสินค้าและการแสดงข้อมูลผู้บริโภค", score: 5, max: 5, status: "Pass", note: "" },
                      { item: "ระบบดับเพลิงและทางหนีไฟ", score: 5, max: 5, status: "Pass", note: "" },
                    ].map((row, i) => (
                      <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium">{row.item}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-slate-900">{row.score}</span>
                          <span className="text-slate-400">/{row.max}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="secondary" 
                            className={row.status === "Pass" 
                              ? "bg-green-50 text-green-700 border-green-100" 
                              : "bg-amber-50 text-amber-700 border-amber-100"}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-500 text-sm">
                          {row.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* History SECTION - RE-ADDED PROPERLY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-slate-400 rounded-full" />
                  ประวัติการประเมินย้อนหลัง
                </h2>
                <Button variant="link" className="text-orange-600 font-bold p-0">ดูทั้งหมด</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { date: "15 ธ.ค. 2023", score: "96%", rank: "A+", color: "green" },
                  { date: "10 พ.ย. 2023", score: "92%", rank: "A", color: "blue" },
                ].map((his, i) => (
                  <Card key={i} className="shadow-none border-slate-200 hover:border-orange-200 transition-colors group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                          <History className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">{his.date}</p>
                          <p className="text-xs text-slate-500">Audit Rank: {his.rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{his.score}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Score</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Score Summary & Stats */}
          <div className="space-y-6">
            {/* Total Score Card */}
            <Card className="bg-black text-white border-none shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-orange-500" />
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Audit Score</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-6xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                    94
                  </div>
                  <div>
                    <div className="text-xl font-bold flex items-center gap-1">
                      / 100 <span className="text-xs text-green-400">(+2.5%)</span>
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Excellent Performance</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[94%]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Low</span>
                    <span>Target: 85%</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <div className="space-y-6 p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ภาพรวมคะแนนแยกหมวด</h3>
              <div className="space-y-5">
                {[
                  { label: "โครงสร้างและพื้นฐาน", score: 100 },
                  { label: "ความสะอาด", score: 85 },
                  { label: "การจัดการขยะ", score: 70 },
                  { label: "ความปลอดภัย", score: 100 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          item.score > 80 ? 'bg-green-500' : item.score > 60 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.score}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auditor Info */}
            <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">ผู้ทำการตรวจสอบ</h3>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                   <User className="size-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">เอกลักษณ์ ยอดเยี่ยม</p>
                  <p className="text-xs text-slate-500">Operation Manager (Admin)</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs font-bold py-5">
                 <InfoIcon className="size-4 mr-2 text-orange-500" /> บันทึกการตรวจสอบฉบับเต็ม
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
