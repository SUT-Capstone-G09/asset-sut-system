export default function AreasFooterInfo() {
  return (
    <div 
      className="
        relative overflow-hidden
        p-12 bg-[#1a1a1a] text-white rounded-3xl shadow-2xl 
      "
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f26522] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="space-y-4">
          <h4 className="text-3xl font-black">พร้อมเริ่มต้นธุรกิจกับเรา?</h4>
          <p className="text-lg text-gray-400 max-w-xl">
            เรามีพื้นที่หลากหลายรูปแบบเพื่อรองรับทุกประเภทธุรกิจ 
            ติดต่อสอบถามข้อมูลการเช่าพื้นที่ได้ที่สํานักงานจัดการทรัพย์สิน SUT
          </p>
        </div>
        <button 
          className="
            whitespace-nowrap px-10 py-5 
            bg-[#f26522] text-white rounded-xl shadow-xl 
            font-black text-lg hover:bg-white hover:text-[#f26522] 
            transition-all 
          "
        >
          ติดต่อสอบถาม
        </button>
      </div>
    </div>
  );
}
