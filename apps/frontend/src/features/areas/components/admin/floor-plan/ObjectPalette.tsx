import React from 'react';
import { 
  Square, HelpCircle
} from 'lucide-react';
import { CanvasMode } from '@/features/areas/types/floor-plan';

interface ObjectPaletteProps {
  onAddElement: (type: string) => void;
  canvasMode: CanvasMode;
  setCanvasMode: (mode: CanvasMode) => void;
}

export default function ObjectPalette({
  onAddElement,
  canvasMode,
}: ObjectPaletteProps) {
  const simplifiedBlueprints = [
    {
      id: 'wall',
      name: 'แนวกำแพง / โครงสร้างอาคาร',
      sub: 'เพิ่มแนวกำแพงหลักหรือขอบอาคาร',
      icon: Square,
      color: 'bg-slate-500/10 border-slate-200 text-slate-600',
      activeColor: 'bg-slate-50 border-slate-400 text-slate-700 ring-2 ring-slate-400/20'
    },
    {
      id: 'area',
      name: 'พื้นที่จัดสรร / โซนแผงค้า',
      sub: 'เพิ่มพื้นที่ร้านค้า ห้องน้ำ หรือนั่งทานอาหาร',
      icon: Square,
      color: 'bg-orange-500/10 border-orange-200 text-[#f26522]',
      activeColor: 'bg-orange-50 border-orange-400 text-[#f26522] ring-2 ring-orange-400/20'
    }
  ];

  return (
    <div className="flex flex-col gap-4 select-none">
      <div>
        <h3 className="text-2xs font-bold tracking-wider text-slate-400 uppercase">
          เพิ่มวัตถุหลัก (ADD OBJECT)
        </h3>
        <p className="text-3xs text-slate-400 mt-1 leading-relaxed">
          กดเลือกประเภทด้านล่าง แล้วคลิกบนผังเพื่อวางวัตถุลงบนแคนวาสได้ทันที
        </p>
      </div>

      {/* Simplified blueprints cards list */}
      <div className="flex flex-col gap-2.5">
        {simplifiedBlueprints.map((item) => {
          const Icon = item.icon;
          const isActive = canvasMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onAddElement(item.id);
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? item.activeColor
                  : 'bg-white border-slate-200 hover:bg-slate-50/70 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className={`p-2.5 rounded-xl border border-black/5 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-700 tracking-tight leading-tight capitalize">
                  {item.name}
                </h4>
                <p className="text-3xs text-slate-400 mt-0.5 truncate leading-none">
                  {item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Help tooltip tip */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex gap-2.5 mt-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          <strong>คำแนะนำ</strong>: คลิกเลือกปุ่มวัตถุที่ต้องการ แล้วนำเมาส์ไปกดคลิกบนพื้นที่ว่างของแคนวาสเพื่อทำการจัดวางวัตถุลงตำแหน่งนั้น
        </p>
      </div>
    </div>
  );
}
