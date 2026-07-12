import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, ChevronLeft, ChevronRight,
  Layers, Search, GripVertical, Copy, Trash2,
  ChevronsUp, ChevronsDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { MapElement } from '@/features/areas/types/floor-plan';

interface LayersPanelProps {
  elements: MapElement[];
  selectedId: string | null;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  deleteElement: (id: string) => void;
  reorderElement: (id: string, action: 'up' | 'down' | 'front' | 'back') => void;
}

function typeDot(el: MapElement) {
  if (el.type === 'wall')          return 'bg-slate-700';
  if (el.areaType === 'shop')      return 'bg-sky-400';
  if (el.areaType === 'toilet')    return 'bg-emerald-400';
  if (el.areaType === 'seating')   return 'bg-amber-400';
  return 'bg-slate-400';
}

interface CtxMenu { x: number; y: number; elementId: string }

export default function LayersPanel({
  elements,
  selectedId,
  selectElement,
  updateElement,
  deleteElement,
  reorderElement,
}: LayersPanelProps) {
  const [isOpen, setIsOpen]           = useState(true);
  const [searchQuery, setSearchQuery]  = useState('');
  const [ctxMenu, setCtxMenu]          = useState<CtxMenu | null>(null);
  const [dragOverId, setDragOverId]    = useState<string | null>(null);

  // Close context menu on outside click / scroll / resize
  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll',    close, true);
    window.addEventListener('resize',    close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll',    close, true);
      window.removeEventListener('resize',    close);
    };
  }, []);

  // Drag-and-drop
  const dragId     = useRef<string | null>(null);

  const handleDrop = () => {
    const from = dragId.current;
    const to   = dragOverId;
    setDragOverId(null);
    if (!from || !to || from === to) return;
    const fromIdx = elements.findIndex(e => e.id === from);
    const toIdx   = elements.findIndex(e => e.id === to);
    const steps   = Math.abs(fromIdx - toIdx);
    const dir     = fromIdx < toIdx ? 'up' : 'down';
    for (let i = 0; i < steps; i++) reorderElement(from, dir);
    dragId.current = null;
  };

  // Filtered + reversed list
  const filtered = elements
    .filter(el =>
      el.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.id.includes(searchQuery) ||
      (el.tenant ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice()
    .reverse();

  // Context menu target element
  const ctxEl = ctxMenu ? elements.find(e => e.id === ctxMenu.elementId) : null;
  const ctxIdx    = ctxEl ? elements.findIndex(e => e.id === ctxEl.id) : -1;
  const canFront  = ctxIdx < elements.length - 1;
  const canBack   = ctxIdx > 0;

  return (
    <div
      className={`relative h-full flex items-center transition-all duration-300 ease-in-out z-10 ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      {/* Toggle pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-white text-slate-400 hover:text-slate-700 border border-l-0 border-slate-200 rounded-r-xl flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md"
          title="Expand Sidebar (แสดงแถบข้าง)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Panel */}
      <div
        className={`w-64 h-full bg-[#F8F9FA] border-r border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between select-none bg-white">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Layers (เลเยอร์วัตถุ)</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
            title="Collapse Sidebar (ซ่อนแถบข้าง)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
              <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-200 bg-white">
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาวัตถุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[11px] font-medium pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-orange-300 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Layer list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic text-center py-8 select-none">ไม่พบวัตถุ</p>
          ) : (
            filtered.map((el) => {
              const isSelected = el.id === selectedId;
              const isVisible  = el.visible !== false;

              return (
                <div key={el.id} className="relative">
                  {/* Insertion line */}
                  {dragOverId === el.id && dragId.current !== el.id && (
                    <div className="absolute -top-px left-2 right-2 h-0.5 bg-orange-500 rounded-full z-10 pointer-events-none shadow-sm" />
                  )}

                  <div
                    draggable
                    onDragStart={() => { dragId.current = el.id; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(el.id); }}
                    onDragLeave={() => setDragOverId(null)}
                    onDragEnd={() => setDragOverId(null)}
                    onDrop={handleDrop}
                    onClick={() => selectElement(el.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      selectElement(el.id);
                      setCtxMenu({ x: e.clientX, y: e.clientY, elementId: el.id });
                    }}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border select-none ${
                      isSelected
                        ? 'bg-orange-50 border-orange-200 text-[#f26522]'
                        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200 text-slate-600'
                    } ${!isVisible ? 'opacity-40' : ''} ${dragOverId === el.id && dragId.current !== el.id ? 'bg-orange-50/40' : ''}`}
                  >
                    {/* Grip */}
                    <GripVertical className="w-3 h-3 text-slate-300 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all" />

                    {/* Dot */}
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDot(el)}`} />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold truncate leading-tight ${isSelected ? 'text-[#f26522]' : 'text-slate-700'}`}>
                        {el.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono truncate leading-none">
                        {el.type === 'wall' ? 'wall' : (el.areaType ?? 'area')}
                      </p>
                    </div>

                    {/* Eye + Lock */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !isVisible }); }}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          !isVisible
                            ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={isVisible ? 'ซ่อน' : 'แสดง'}
                      >
                        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); updateElement(el.id, { locked: !el.locked }); }}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          el.locked
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={el.locked ? 'ปลดล็อก' : 'ล็อก'}
                      >
                        {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-slate-200 bg-white select-none">
          <p className="text-[9px] text-slate-400 text-center leading-relaxed">
            ลากเพื่อเรียงลำดับ · คลิกขวาสำหรับตัวเลือกเพิ่มเติม
          </p>
        </div>
      </div>

      {/* Context Menu */}
      {ctxMenu && ctxEl && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[200] bg-[#F8F9FA] border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[200px] flex flex-col gap-0.5 select-none"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
            <p className="text-[9px] font-semibold tracking-widest text-[#f26522] uppercase">
              {ctxEl.type === 'wall' ? 'Structure' : ctxEl.areaType ?? 'Area'}
            </p>
            <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">{ctxEl.name}</p>
          </div>

          <div className="p-1.5 flex flex-col gap-0.5 bg-slate-50/50">
            {/* Visibility */}
            <button
              onClick={() => { updateElement(ctxEl.id, { visible: ctxEl.visible === false ? true : false }); setCtxMenu(null); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              {ctxEl.visible !== false ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-[#f26522]" />}
              <span>{ctxEl.visible !== false ? 'Hide (ซ่อน)' : 'Show (แสดง)'}</span>
            </button>

            {/* Lock */}
            <button
              onClick={() => { updateElement(ctxEl.id, { locked: !ctxEl.locked }); setCtxMenu(null); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              {ctxEl.locked ? <Unlock className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
              <span>{ctxEl.locked ? 'Unlock (ปลดล็อก)' : 'Lock (ล็อก)'}</span>
            </button>

            <div className="my-1 border-t border-slate-200" />

            {/* Arrange */}
            <p className="px-3 pb-0.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Arrange (จัดลำดับ)</p>

            <button onClick={() => { reorderElement(ctxEl.id, 'front'); setCtxMenu(null); }} disabled={!canFront}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${canFront ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
              <ChevronsUp className="w-4 h-4 text-slate-400" /> <span>Bring to Front (ไว้หน้าสุด)</span>
            </button>

            <button onClick={() => { reorderElement(ctxEl.id, 'up'); setCtxMenu(null); }} disabled={!canFront}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${canFront ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
              <ArrowUp className="w-4 h-4 text-slate-400" /> <span>Move Forward (เลื่อนขึ้นหน้า)</span>
            </button>

            <button onClick={() => { reorderElement(ctxEl.id, 'down'); setCtxMenu(null); }} disabled={!canBack}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${canBack ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
              <ArrowDown className="w-4 h-4 text-slate-400" /> <span>Move Backward (เลื่อนลงหลัง)</span>
            </button>

            <button onClick={() => { reorderElement(ctxEl.id, 'back'); setCtxMenu(null); }} disabled={!canBack}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${canBack ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
              <ChevronsDown className="w-4 h-4 text-slate-400" /> <span>Send to Back (ไว้หลังสุด)</span>
            </button>

            <div className="my-1 border-t border-slate-200" />

            {/* Delete */}
            <button
              onClick={() => { if (confirm(`ต้องการลบ "${ctxEl.name}"?`)) deleteElement(ctxEl.id); setCtxMenu(null); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete (ลบออก)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
