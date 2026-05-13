import { Eye, Calendar, Printer, CheckCircle2, Download } from "lucide-react"

interface NewsPreviewProps {
  data: {
    title: string;
    category: string;
    details: string;
    qualifications: string;
    documents: string;
    contractDuration: string;
    areaSize: string;
    entranceFee: string;
  };
}

export function NewsPreview({ data }: NewsPreviewProps) {
  const displayTitle = data.title || "หัวข้อประกาศของคุณ (Preview)"
  const displayCategory = data.category || "พื้นที่เช่าร้านอาหาร"
  const displayDetails = data.details || "รายละเอียดประกาศเพิ่มเติมของคุณจะแสดงที่นี่..."
  
  const displayContractDuration = data.contractDuration || "[ระบุ]"
  const displayAreaSize = data.areaSize || "[ระบุ]"
  const displayEntranceFee = data.entranceFee || "[ระบุ]"

  const qualsList = data.qualifications 
    ? data.qualifications.split('\n').filter(q => q.trim() !== '')
    : ['มีสัญชาติไทย', 'มีประสบการณ์ด้านโภชนาการไม่น้อยกว่า 3 ปี'];

  const docsList = data.documents 
    ? data.documents.split('\n').filter(d => d.trim() !== '')
    : ['สำเนาบัตรประชาชน', 'ทะเบียนบ้าน']; 


  // จำลองวันที่ปัจจุบัน
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mt-16 pt-8 border-t-4 border-brand-primary">
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
        <Eye className="w-7 h-7 text-brand-primary" strokeWidth={2.5} /> 
        ตัวอย่างหน้าประกาศ (Preview แบบหน้ารายละเอียด)
      </h2>
      
      <div className="border border-zinc-200 rounded-xl p-8 bg-zinc-50 min-h-[300px]">
        
        {/* Main Content Area Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
            {/* Hero Section Placeholder */}
            <div className="relative aspect-[16/7] w-full bg-zinc-200">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
                  [ ภาพหน้าปกประกาศ ]
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-8">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {displayCategory}
                    </span>
                </div>
            </div>

            <div className="p-8 lg:p-12">
                {/* Metadata */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>ประกาศเมื่อ: {today}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span>เข้าชมแล้ว: 0 ครั้ง</span>
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 leading-[1.2]">
                    {displayTitle}
                </h1>

                <div className="prose prose-orange max-w-none">
                    <p className="text-gray-600 leading-relaxed text-lg mb-10 whitespace-pre-line">
                        {displayDetails}
                    </p>

                    <h2 className="text-2xl font-bold text-[#C2410C] mb-6">คุณสมบัติเบื้องต้น</h2>
                    <div className="space-y-4 mb-12">
                        {qualsList.map((text, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                                <div className="mt-1 bg-orange-100 rounded-full p-0.5">
                                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {text.replace(/^- /, '')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Required Documents Grid */}
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-12">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">เอกสารที่ต้องใช้ในการสมัคร</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {docsList.map((doc, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {doc.replace(/^- /, '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ระยะเวลาการเช่าและพื้นที่</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                            <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">ระยะเวลาสัญญา</p>
                            <p className="font-bold text-gray-900">{displayContractDuration} ปี</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                            <div className="w-6 h-6 bg-orange-500/10 rounded flex items-center justify-center mx-auto mb-3">
                                <span className="text-orange-600 font-black text-xs">A</span>
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">ขนาดพื้นที่</p>
                            <p className="font-bold text-gray-900">{displayAreaSize} ตร.ม.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                            <Download className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">ค่าธรรมเนียมแรกเข้า</p>
                            <p className="font-bold text-gray-900 text-sm">{displayEntranceFee} บาท</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
