import { LibraryBig } from "lucide-react"

export function EvalCategoryHeader() {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
          <LibraryBig className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          จัดการหมวดหมู่และเกณฑ์การประเมิน
        </h1>
      </div>
      <p className="text-slate-500 pl-14">
        กำหนดหมวดหมู่หลักและเกณฑ์การให้คะแนนย่อย เพื่อนำไปใช้สร้างชุดแบบประเมินสำหรับร้านค้า
      </p>
    </div>
  );
}
