import { Button } from '@/components/ui/button';

export default function AreasBanner() {
  return (
    <section 
      className="
        relative w-full h-[85vh] min-h-[700px] 
        flex items-center overflow-hidden 
        bg-[#fcfcfc]
      "
    >
      {/* Background Image */}
      <div 
        className="
          absolute inset-0 z-0
          [mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)]
        "
      >
        <div 
          className="
            absolute inset-0 
            bg-cover bg-center 
            transition-transform duration-[20s] hover:scale-105
          "
          style={{ backgroundImage: "url('/Banner-Space.png')" }}
        />
        {/* gradient for text box */}
        <div 
          className="
            absolute inset-0 z-10
            bg-gradient-to-r from-black/80 via-black/20 to-transparent 
          " 
        />
      </div>
      
      {/* Content Container */}
      <div 
        className="
          container mx-auto px-8 md:px-20 
          relative z-20 
          flex justify-start items-center
        "
      >
        <div 
          className="
            max-w-xl space-y-8 
            flex flex-col items-start text-left
          "
        >
          <div 
            className="
              text-[9px] font-black uppercase tracking-[0.6em] 
              text-[#f26522] opacity-80 mb-2
            "
          >
            SUT Asset Management
          </div>

          <h1 
            className="
              text-6xl md:text-7xl font-black uppercase 
              text-white leading-[0.9] tracking-tighter
            "
          >
            YOUR NEXT <br />
            <span className="text-[#f26522]">BUSINESS</span> <br />
            SPACE
          </h1>

          <p 
            className="
              max-w-sm text-lg font-medium italic leading-relaxed tracking-wide 
              text-white/60
            "
          >
            ค้นพบพื้นที่ศักยภาพเพื่อการเติบโตที่ไม่สิ้นสุด 
            ในระบบนิเวศนวัตกรรมที่ทันสมัยที่สุดของมหาวิทยาลัย
          </p>

          <div className="pt-4">
            <Button 
              className="
                h-14 px-10 
                bg-[#f26522] hover:bg-[#dd5b1c] text-white 
                rounded-none font-bold uppercase text-[11px] tracking-[0.2em] 
                transition-all
              "
            >
              Explore Projects
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
