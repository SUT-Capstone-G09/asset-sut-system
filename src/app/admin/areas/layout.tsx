import React from "react";

export default function AdminAreasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      {/* Sidebar Placeholder (รอเพื่อนมาใส่) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#f26522]">Asset SUT</h1>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {/* Placeholder Menu Items */}
          {[
            "แดชบอร์ด",
            "จัดการพื้นที่เช่า",
            "การจองพื้นที่เช่า",
            "รายชื่อผู้เช่า/สัญญา",
            "คำขอย้าย/ต่อสัญญา",
            "รายงาน",
            "เอกสาร/ไฟล์",
            "ตั้งค่า",
          ].map((item) => (
            <div
              key={item}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                item === "จัดการพื้นที่เช่า"
                  ? "bg-[#f26522]/10 text-[#f26522]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-6">
           <button className="w-full py-3 bg-[#f26522] text-white rounded-lg font-bold shadow-lg shadow-[#f26522]/20 hover:bg-[#d8561d] transition-colors">
             ออกจากระบบ
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
