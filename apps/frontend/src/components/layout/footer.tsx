import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative w-full bg-[#F06222] text-white py-12 px-6 md:px-16 overflow-hidden">
      {/* Background Patterns */}
      <div id="surya-left" className="absolute left-0 top-0 w-[1000px] h-[1000px] opacity-[0.3] pointer-events-none -translate-x-[450px] -translate-y-[450px]">
        <div 
          className="w-full h-full animate-[spin_60s_linear_infinite]"
          style={{
            backgroundImage: 'url("/surya-graphic/Surya_graphic device-02.png")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      </div>
      <div id="surya-right" className="absolute right-0 bottom-0 w-[1000px] h-[1000px] opacity-[0.3] pointer-events-none translate-x-[400px] translate-y-[400px]">
        <div 
          className="w-full h-full animate-[spin_80s_linear_infinite]"
          style={{
            backgroundImage: 'url("/surya-graphic/Surya_graphic device-02.png")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-x-24 relative z-10 px-4">
        {/* Column 1: Contact & Address */}
        <div className="space-y-4">
          <div className="space-y-0">
            <h2 className="text-2xl font-bold leading-tight">ติดต่อ</h2>
            <h3 className="text-2xl font-bold leading-tight">ส่วนบริหารสินทรัพย์</h3>
          </div>
          <div className="text-sm opacity-90 leading-relaxed max-w-xs pt-2">
            อาคารบริหาร ชั้น 1 111<br />
            มหาวิทยาลัยเทคโนโลยีสุรนารี ถ.มหาวิทยาลัย<br />
            ต.สุรนารี อ.เมือง จ.นครราชสีมา 30000
          </div>
          <div className="pt-12 text-xs opacity-80">
            © 2026 DAMTSUT – , Suranaree University of Technology
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold border-b border-white/20 pb-2 inline-block">ข้อมูลการติดต่อ</h4>
          <div className="space-y-3 text-sm pt-2">
            <p className="flex items-center gap-2">
              <a href="mailto:damtsut@g.sut.ac.th" className="hover:underline opacity-90">
                damtsut@g.sut.ac.th
              </a>
            </p>
            <p className="opacity-90">โทรศัพท์ +66-44-22-4946</p>
            <p className="opacity-90">โทรสาร +66-44-22-4906</p>
          </div>
        </div>

        {/* Column 3: Info For & Social */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-white/20 pb-2 inline-block">ข้อมูลสำหรับ</h4>
            <ul className="space-y-2 text-sm pt-2">
              <li><Link href="#" className="hover:underline opacity-90">สมาชิก</Link></li>
              <li><Link href="#" className="hover:underline opacity-90">นักศึกษา</Link></li>
              <li><Link href="#" className="hover:underline opacity-90">คณาจารย์และเจ้าหน้าที่</Link></li>
            </ul>
          </div>
          
          <div className="flex gap-5 pt-2">
            {/* Facebook */}
            <a href="#" className="hover:scale-110 transition-transform bg-white/10 p-2 rounded-full">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:scale-110 transition-transform bg-white/10 p-2 rounded-full">
              <svg className="w-5 h-5 stroke-white fill-none stroke-2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* Youtube */}
            <a href="#" className="hover:scale-110 transition-transform bg-white/10 p-2 rounded-full">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"></path>
                <polygon fill="black" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
