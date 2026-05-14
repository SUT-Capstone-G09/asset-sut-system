import { Button } from '@/components/ui/button';

export default function HomeBanner() {
  return (
    <section 
      className="
        relative w-full h-[80vh] min-h-[600px] 
        flex items-center overflow-hidden 
        bg-black
      "
    >
      {/* Background Image */}
      <div 
        className="
          absolute inset-0 z-0
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
        {/* Dark Overlay for better contrast */}
        <div 
          className="
            absolute inset-0 z-10
            bg-black/30
          " 
        />
      </div>
      
      {/* Content Container (Optional: can be empty if only image is needed, but usually has title) */}
      <div 
        className="
          container mx-auto px-8 md:px-20 
          relative z-20 
          flex flex-col justify-center items-center text-center
        "
      >
        {/* You can add text here if needed, or leave it empty for a clean banner */}
      </div>
    </section>
  );
}
