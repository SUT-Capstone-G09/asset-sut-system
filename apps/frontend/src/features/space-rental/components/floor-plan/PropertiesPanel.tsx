import React from 'react';
import {
  Trash2, Lock, Unlock, MousePointer2,
  Tag, User, SlidersHorizontal, FileText
} from 'lucide-react';
import { MapElement, MapLayer } from '@/features/space-rental/types/floor-plan';

interface PropertiesPanelProps {
  element: MapElement | null;
  layers: MapLayer[];
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  deleteElement: (id: string) => void;
}

// Reusable field wrapper
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
        {label}
      </label>
      {children}
    </div>
  );
}

// Reusable section heading
function Section({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <Icon className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

const inputCls =
  'w-full text-[11px] font-medium px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-slate-700 placeholder:text-slate-300';

const STATUS_OPTIONS: { value: MapElement['status']; label: string; dot: string }[] = [
  { value: 'occupied',    label: 'มีผู้เช่า', dot: 'bg-blue-400'    },
  { value: 'maintenance', label: 'ปรับปรุง',  dot: 'bg-orange-400'  },
  { value: 'open',        label: 'ว่าง',      dot: 'bg-emerald-400' },
];

export default function PropertiesPanel({
  element,
  layers,
  updateElement,
  deleteElement,
}: PropertiesPanelProps) {

  // Empty state
  if (!element) {
    return (
      <aside className="w-72 bg-[#F8F9FA] border-l border-slate-200 flex flex-col items-center justify-center p-8 text-center select-none shrink-0 h-full">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <MousePointer2 className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-[11px] font-bold text-slate-600 leading-snug">เลือกวัตถุบน Canvas</p>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-[160px]">
          คลิกที่ร้านค้า กำแพง หรือพื้นที่ใดก็ได้บนแผนที่เพื่อดูหรือแก้ไขรายละเอียด
        </p>
      </aside>
    );
  }

  // Helpers
  const set = (field: keyof MapElement, value: unknown) =>
    updateElement(element.id, { [field]: value });

  // Main panel
  return (
    <aside className="w-72 bg-[#F8F9FA] border-l border-slate-200 flex flex-col shrink-0 h-full overflow-hidden select-none">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 bg-white shrink-0">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-[9px] font-bold text-[#f26522] uppercase tracking-widest">
            {element.type === 'wall' ? 'Structure' : element.areaType ?? 'Area'}
          </span>
          <span className="text-[9px] text-slate-400 font-mono ml-auto">#{element.id}</span>
        </div>

        {/* Name */}
        <input
          type="text"
          value={element.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full text-sm font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:-mx-2 focus:rounded-lg focus:ring-2 focus:ring-orange-100 transition-all py-0.5 truncate"
        />

        {/* Status pill row */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => set('status', s.value)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-all cursor-pointer ${
                element.status === s.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-white">

        {/* Identity section */}
        <div className="space-y-3">
          <Section icon={Tag} title="ประเภทวัตถุ" />

          {/* Core type */}
          <Field label="ประเภทหลัก">
            <select
              value={element.type}
              onChange={(e) => {
                const t = e.target.value as 'area' | 'wall';
                updateElement(element.id, {
                  type: t,
                  areaType: t === 'area' ? 'shop' : undefined,
                  customAreaType: undefined,
                  layerId: t === 'area' ? 'shops' : 'areas',
                });
              }}
              className={inputCls}
            >
              <option value="wall">กำแพง / โครงสร้าง</option>
              <option value="area">พื้นที่ / โซน</option>
            </select>
          </Field>

          {/* Area subtype */}
          {element.type === 'area' && (
            <Field label="ประเภทโซนย่อย">
              <select
                value={element.areaType ?? 'shop'}
                onChange={(e) => {
                  const at = e.target.value as MapElement['areaType'];
                  updateElement(element.id, {
                    areaType: at,
                    layerId: at === 'shop' ? 'shops' : at === 'toilet' ? 'toilet' : 'areas',
                    ...(at !== 'other' && { customAreaType: undefined }),
                  });
                }}
                className={inputCls}
              >
                <option value="shop">ร้านค้า / Shop</option>
                <option value="toilet">ห้องน้ำ / Restroom</option>
                <option value="seating">พื้นที่นั่งทานอาหาร / Seating</option>
                <option value="other">อื่น ๆ / Custom</option>
              </select>
            </Field>
          )}

          {/* Custom area type */}
          {element.type === 'area' && element.areaType === 'other' && (
            <Field label="ชื่อประเภทที่กำหนดเอง">
              <input
                type="text"
                value={element.customAreaType ?? ''}
                onChange={(e) => set('customAreaType', e.target.value)}
                placeholder="เช่น จุดคืนจาน, ลานกิจกรรม"
                className={inputCls}
              />
            </Field>
          )}
        </div>

        {/* Tenant */}
        {element.type === 'area' && element.areaType === 'shop' && (
          <div className="space-y-3">
            <Section icon={User} title="ข้อมูลผู้เช่าแผง" />
            <Field label="ชื่อร้านค้า / ผู้เช่า">
              <input
                type="text"
                value={element.tenant ?? ''}
                onChange={(e) => set('tenant', e.target.value)}
                placeholder="เช่น ร้านข้าวมันไก่ตอน"
                className={inputCls}
              />
            </Field>
            <Field label="รหัสแผงค้า (Label)">
              <input
                type="text"
                value={element.label ?? ''}
                onChange={(e) => set('label', e.target.value)}
                placeholder="เช่น A01, B02"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Size & Position */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Section icon={SlidersHorizontal} title="ขนาด / ตำแหน่ง" />
            <button
              onClick={() => set('locked', !element.locked)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all cursor-pointer shrink-0 ml-2 ${
                element.locked
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              {element.locked
                ? <><Lock className="w-2.5 h-2.5" /><span>ล็อก</span></>
                : <><Unlock className="w-2.5 h-2.5" /><span>ไม่ล็อก</span></>
              }
            </button>
          </div>

          {/* W / H grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
            <Field label="กว้าง (px)">
              <div className="space-y-1">
                <input
                  type="number"
                  value={element.width}
                  onChange={(e) => set('width', Math.max(10, Number(e.target.value)))}
                  className={inputCls}
                  step={5}
                  min={10}
                />
                <span className="text-[9px] text-[#f26522] font-black block pl-1">~ {(element.width / 20).toFixed(1)} ม. (Scale 1:20)</span>
              </div>
            </Field>
            <Field label="สูง (px)">
              <div className="space-y-1">
                <input
                  type="number"
                  value={element.height}
                  onChange={(e) => set('height', Math.max(10, Number(e.target.value)))}
                  className={inputCls}
                  step={5}
                  min={10}
                />
                <span className="text-[9px] text-[#f26522] font-black block pl-1">~ {(element.height / 20).toFixed(1)} ม. (Scale 1:20)</span>
              </div>
            </Field>
            <Field label="พิกัด X (px)">
              <input
                type="number"
                value={element.x}
                onChange={(e) => set('x', Number(e.target.value))}
                className={inputCls}
                step={5}
              />
            </Field>
            <Field label="พิกัด Y (px)">
              <input
                type="number"
                value={element.y}
                onChange={(e) => set('y', Number(e.target.value))}
                className={inputCls}
                step={5}
              />
            </Field>
            {element.type === 'area' && (
              <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">พื้นที่คำนวณจริง:</span>
                <span className="text-[11px] font-black text-slate-700">{((element.width / 20) * (element.height / 20)).toFixed(1)} ตร.ม.</span>
              </div>
            )}
          </div>

          {/* Rotation */}
          <Field label={`มุมหมุน: ${element.rotation}°`}>
            <input
              type="range"
              min={0}
              max={360}
              value={element.rotation}
              onChange={(e) => set('rotation', Number(e.target.value))}
              className="w-full accent-[#f26522] cursor-pointer"
            />
          </Field>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <Section icon={FileText} title="บันทึกข้อความ" />
          <Field label="คำอธิบายเพิ่มเติม">
            <textarea
              value={element.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="เช่น ข้อมูลขนาดสัญญา, หมายเหตุกระแสไฟฟ้า..."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

      </div>

      {/* Footer: Delete */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <button
          onClick={() => {
            if (confirm(`ต้องการลบวัตถุ "${element.name}" หรือไม่?`)) deleteElement(element.id);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Object (ลบวัตถุนี้)
        </button>
      </div>

    </aside>
  );
}
