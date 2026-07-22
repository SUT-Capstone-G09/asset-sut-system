import { Eye, Calendar, Printer, CheckCircle2, Download, FileText } from "lucide-react"

interface NewsPreviewProps {
  data: {
    title: string;
    category: string;
    resultTimeline: string;
    qualifications: { id: string; text: string }[];
    documents: { id: string; name: string; isPreset: boolean; checked?: boolean }[];
    contractDuration: string;
    areaSize: string;
    entranceFee: string;
    mainImagePreview?: string | null;
    attachedFiles?: { file: File; id: string }[];
    startDate?: string;
    endDate?: string;
  };
}

export function NewsPreview({ data }: NewsPreviewProps) {
  const displayTitle = data.title || "หัวข้อประกาศของคุณ (Preview)"
  const displayCategory = data.category || "พื้นที่เช่าร้านอาหาร"
  const displayDetails = data.resultTimeline || "รายละเอียดประกาศเพิ่มเติมของคุณจะแสดงที่นี่..."
  
  const hasContractInfo = !!(data.contractDuration || data.areaSize || data.entranceFee)
  const displayContractDuration = data.contractDuration
  const displayAreaSize = data.areaSize
  const displayEntranceFee = data.entranceFee

  const qualsList = data.qualifications
    ? data.qualifications.map((q) => q.text).filter((t) => t.trim() !== "")
    : []

  const docsList = data.documents
    ? data.documents.map((d) => d.name).filter((n) => n.trim() !== "")
    : [] 


  // จำลองวันที่ปัจจุบัน
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formatThaiDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  const displayStartDate = formatThaiDate(data.startDate) || today;
  const displayEndDate = formatThaiDate(data.endDate);

  return (
    <div className="mt-16 pt-8 border-t-4 border-brand-primary">
      <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
        <Eye className="w-7 h-7 text-brand-primary" strokeWidth={2.5} /> 
        ตัวอย่างหน้าประกาศ (Preview แบบหน้ารายละเอียด)
      </h2>
      
      <div className="bg-slate-100 p-8 rounded-3xl">
        
        {/* Main Content Area Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
            {/* Hero Section Placeholder / Image */}
            <div className="relative aspect-[16/7] w-full bg-zinc-200">
                {data.mainImagePreview ? (
                    <img
                        src={data.mainImagePreview}
                        alt="ภาพหลักของประกาศ"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
                      [ ภาพหน้าปกประกาศ ]
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-8">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {displayCategory}
                    </span>
                </div>
            </div>

            <div className="p-8 lg:p-12">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 font-medium">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>ประกาศเมื่อ: {displayStartDate}</span>
                    </div>
                    {displayEndDate && (
                      <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-500" />
                          <span>สิ้นสุดประกาศ: {displayEndDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span>เข้าชมแล้ว: 0 ครั้ง</span>
                    </div>
                </div>

                {/* Print button */}
                <div className="flex justify-end mb-8">
                    <button className="flex items-center gap-2 text-[#C2410C] hover:text-[#9a330a] font-bold text-sm bg-orange-50 px-4 py-2 rounded-xl transition-colors">
                        <Printer className="w-4 h-4" />
                        พิมพ์เอกสารประกาศ
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                    {displayTitle}
                </h1>

                {/* Content body */}
                <div className="prose max-w-none text-gray-600 mb-12 leading-relaxed">
                    <p className="whitespace-pre-wrap">
                        {displayDetails}
                    </p>

                    {qualsList.length > 0 && (
                      <>
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
                      </>
                    )}

                    {/* Required Documents Grid */}
                    {docsList.length > 0 && (
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
                    )}

                    {hasContractInfo && (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">ระยะเวลาการเช่าและพื้นที่</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                            {displayContractDuration && (
                              <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                  <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">ระยะเวลาสัญญา</p>
                                  <p className="font-bold text-gray-900">{displayContractDuration} ปี</p>
                              </div>
                            )}
                            {displayAreaSize && (
                              <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                  <div className="w-6 h-6 bg-orange-500/10 rounded flex items-center justify-center mx-auto mb-3">
                                      <span className="text-orange-600 font-black text-xs">A</span>
                                  </div>
                                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">ขนาดพื้นที่</p>
                                  <p className="font-bold text-gray-900">{displayAreaSize} ตร.ม.</p>
                              </div>
                            )}
                            {displayEntranceFee && (
                              <div className="p-6 rounded-2xl bg-white border border-gray-100 text-center shadow-sm">
                                  <Download className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">ค่าธรรมเนียมแรกเข้า</p>
                                  <p className="font-bold text-gray-900 text-sm">{displayEntranceFee} บาท</p>
                              </div>
                            )}
                        </div>
                      </>
                    )}

                    {/* Attached files for download (เอกสารดาวน์โหลดเพิ่มเติม - ย้ายมาไว้ล่างสุด) */}
                    {data.attachedFiles && data.attachedFiles.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">เอกสารดาวน์โหลดเพิ่มเติม</h3>
                        <div className="space-y-3">
                          {data.attachedFiles.map((item) => {
                            const formattedSize = (item.file.size / (1024 * 1024)).toFixed(2) + " MB";
                            return (
                              <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-zinc-800 truncate max-w-xs sm:max-w-md">{item.file.name}</p>
                                    <p className="text-xs text-zinc-500">{formattedSize}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 cursor-pointer hover:text-orange-600 flex-shrink-0 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                                  <Download className="w-4 h-4" /> ดาวน์โหลด
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
