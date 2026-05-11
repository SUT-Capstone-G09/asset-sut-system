import { Utensils, Trophy } from 'lucide-react';
import { Location } from '@/features/areas/types/location';
import AreaCard from './AreaCard';

interface AreasListProps {
  categories: string[];
  locations: Location[];
}

export default function AreasList({ categories, locations }: AreasListProps) {
  return (
    <section className="space-y-12">
      {categories.map((cat) => (
        <div key={cat} className="space-y-8">
          {/* Category Header */}
          <div className="flex items-center gap-4">
            <div 
              className="
                w-12 h-12 flex items-center justify-center 
                bg-[#f26522] text-white rounded-xl 
                shadow-lg shadow-[#f26522]/20
              "
            >
              {cat === 'โรงอาหาร' ? <Utensils size={24} /> : <Trophy size={24} />}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{cat}</h3>
              <p className="text-sm font-medium text-gray-500">
                พบ {locations.filter(loc => loc.category === cat).length} สถานที่ในหมวดหมู่นี้
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations
              .filter(loc => loc.category === cat)
              .map(loc => (
                <AreaCard key={loc.id} location={loc} />
              ))
            }
          </div>
        </div>
      ))}
    </section>
  );
}
