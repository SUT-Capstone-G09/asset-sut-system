import { Utensils, Trophy } from "lucide-react";
import { Location } from "@/features/areas/types/location";
import PublicAreaCard from "./PublicAreaCard";

interface AreasListProps {
  categories: string[];
  locations: Location[];
}

export default function AreasList({ categories, locations }: AreasListProps) {
  return (
    <section className="space-y-16">
      {categories.map((cat) => (
        <div key={cat} className="space-y-8">
          {/* Category Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-[#f26522] text-white rounded-[7px] shadow-lg shadow-[#f26522]/20">
              {cat === "โรงอาหาร" ? (
                <Utensils size={24} />
              ) : (
                <Trophy size={24} />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {cat}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                พบ {locations.filter((loc) => loc.category === cat).length}{" "}
                สถานที่ในหมวดหมู่นี้
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {locations
              .filter((loc) => loc.category === cat)
              .map((loc) => (
                <PublicAreaCard key={loc.id} location={loc} />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
