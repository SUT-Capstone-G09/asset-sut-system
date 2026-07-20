import {
  Building2,
  Coffee,
  ShoppingBag,
  Box,
  Shirt,
  CreditCard,
  Radio,
  Monitor,
  Tv,
  Printer,
  MapPin,
  Utensils,
  LucideIcon,
} from "lucide-react";
import { COMMERCIAL_CATEGORIES } from "../../constants";

const iconMap: Record<string, LucideIcon> = {
  Coffee,
  ShoppingBag,
  Box,
  Shirt,
  CreditCard,
  Radio,
  Monitor,
  Tv,
  Printer,
  MapPin,
  Utensils,
  Building2,
};

export default function AreasAbout() {
  const insights = [
    {
      label: "Commercial Units",
      value: "142",
      detail: "ร้านค้าและพื้นที่ให้บริการ",
    },
    {
      label: "Infrastructure Points",
      value: "385",
      detail: "จุดเชื่อมต่อและโครงสร้างดิจิทัล",
    },
    {
      label: "Activity Zones",
      value: "12",
      detail: "โซนที่มีการใช้งานหนาแน่น",
    },
  ];

  const categories = COMMERCIAL_CATEGORIES;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 space-y-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-100 pb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#f26522]/10 flex items-center justify-center">
                <Building2 size={14} className="text-[#f26522]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f26522]">
                Campus Insights
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              สถิติและประเภทพื้นที่เชิงพาณิชย์
            </h2>

            <p className="text-sm text-gray-400 max-w-2xl">
              ภาพรวมพื้นที่เชิงพาณิชย์ ระบบบริการ และโครงสร้างพื้นฐาน ที่รองรับการใช้งานของนักศึกษา บุคลากร และผู้ประกอบการ ภายในมหาวิทยาลัยเทคโนโลยีสุรนารี
            </p>
          </div>

          {/* Side Description */}
          <div className="flex items-end shrink-0 lg:max-w-xs">
            <div className="border-l-2 border-[#f26522]/30 pl-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Operational Overview
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                ครอบคลุมตั้งแต่ร้านค้า พื้นที่บริการ ไปจนถึงระบบโครงสร้างพื้นฐานด้านดิจิทัลและการเชื่อมต่อภายในมหาวิทยาลัย
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {insights.map((item, idx) => (
            <div key={idx} className="space-y-3 border-b border-gray-100 pb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                {item.label}
              </p>

              <div className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                {item.value}
              </div>

              <p className="text-sm text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f26522]">
              Service Categories
            </h3>

            <p className="text-sm text-gray-500">
              การแบ่งประเภทพื้นที่และบริการภายในมหาวิทยาลัย
            </p>
          </div>

          <div className="border-t border-gray-100">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[32px_1fr_auto] items-start gap-5 py-6 border-b border-gray-100"
              >
                <div className="pt-0.5 text-gray-300">
                  {(() => {
                    const IconComponent = iconMap[cat.iconName] || Building2;
                    return <IconComponent size={16} />;
                  })()}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {cat.title}
                  </h4>

                  <p className="text-sm leading-relaxed text-gray-500">
                    {cat.desc}
                  </p>
                </div>

                <div className="text-sm font-semibold text-gray-400 whitespace-nowrap">
                  {cat.count} Units
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
