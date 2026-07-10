import React, { useState, useRef, useEffect } from 'react';
import {
  Lock, Unlock, Copy, Trash2, ArrowUp, ZoomIn, ZoomOut, Maximize2,
  MousePointer, Square, Eye, EyeOff, ChevronsUp, ChevronsDown, ArrowDown
} from 'lucide-react';
import { MapElement, MapLayer, CanvasMode } from '@/features/space-rental/types/floor-plan';

interface CanvasProps {
  elements: MapElement[];
  layers: MapLayer[];
  selectedId: string | null;
  canvasMode: CanvasMode;
  scale: number;
  pan: { x: number; y: number };
  selectElement: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<MapElement>) => void;
  deleteElement: (id: string) => void;
  addElement: (element: MapElement) => void;
  reorderElement: (id: string, action: 'up' | 'down' | 'front' | 'back') => void;
  setCanvasMode: (mode: CanvasMode) => void;
  setScale: (scale: number | ((prev: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  previewMode: boolean;
}

type DragAction = 'none' | 'pan' | 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'rotate';

export default function Canvas({
  elements,
  layers,
  selectedId,
  canvasMode,
  scale,
  pan,
  selectElement,
  updateElement,
  deleteElement,
  addElement,
  reorderElement,
  setCanvasMode,
  setScale,
  setPan,
  previewMode
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragAction, setDragAction] = useState<DragAction>('none');
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Hover states for preview mode tooltips
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Context Menu State
  interface ContextMenuState {
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
    elementId: string | null;
  }
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Close context menu on window activities
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('mousedown', handleClose);
    window.addEventListener('resize', handleClose);
    window.addEventListener('wheel', handleClose);
    return () => {
      window.removeEventListener('mousedown', handleClose);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('wheel', handleClose);
    };
  }, []);

  // Dragging states
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartPan = useRef({ x: 0, y: 0 });
  const dragStartElementCoords = useRef({ x: 0, y: 0, w: 0, h: 0, r: 0 });

  // Floating toolbar state
  const selectedElement = elements.find(el => el.id === selectedId);

  // Monitor Spacebar key down for dragging canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Native listener for non-passive wheel events to lock browser zoom and handle custom zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Prevent browser zoom and default page scrolling
      e.preventDefault();

      if (previewMode && !isSpacePressed) return;

      const zoomFactor = 1.08;
      const newScale = e.deltaY < 0 ? Math.min(4, scale * zoomFactor) : Math.max(0.1, scale / zoomFactor);

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const localX = (mouseX - pan.x) / scale;
      const localY = (mouseY - pan.y) / scale;

      setPan({
        x: mouseX - localX * newScale,
        y: mouseY - localY * newScale
      });
      setScale(newScale);
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [scale, pan, previewMode, isSpacePressed, setScale, setPan]);

  // Lock Ctrl + / - / 0 browser keyboard zoom and handle it on canvas instead
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        if (e.key === '=' || e.key === '+') {
          setScale(s => Math.min(4.0, s + 0.1));
        } else if (e.key === '-') {
          setScale(s => Math.max(0.1, s - 0.1));
        } else if (e.key === '0') {
          setScale(0.8);
          setPan({ x: 20, y: -80 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setScale, setPan]);

  // Utility to convert client mouse coords to local SVG coords
  const getSVGCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();

    // Offset relative to canvas wrapper
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Adjust for pan and zoom scale
    const x = (relativeX - pan.x) / scale;
    const y = (relativeY - pan.y) / scale;

    return { x, y };
  };

  // Zoom helpers
  const handleZoomIn = () => setScale(s => Math.min(4.0, s + 0.1));
  const handleZoomOut = () => setScale(s => Math.max(0.1, s - 0.1));
  const handleResetZoom = () => {
    setScale(0.8);
    setPan({ x: 20, y: -80 });
  };

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddleClick = e.button === 1;
    const isLeftClick = e.button === 0;

    const isBackgroundClick = e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === 'svg' ||
      (e.target as HTMLElement).tagName === 'SVG';

    if (isMiddleClick || isSpacePressed || (canvasMode === 'select' && isBackgroundClick)) {
      if (canvasMode === 'select' && isLeftClick) {
        selectElement(null); // Clear selection when clicking the empty background!
      }
      // Pan mode
      setDragAction('pan');
      dragStartMouse.current = { x: e.clientX, y: e.clientY };
      dragStartPan.current = { ...pan };
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    if (canvasMode !== 'select' && isLeftClick) {
      // Shape Creation Mode - Click to place
      const coords = getSVGCoords(e.clientX, e.clientY);
      const newId = String(Math.floor(Math.random() * 1000) + 200);

      const newElement: MapElement = {
        id: newId,
        name: canvasMode === 'wall' ? 'แนวกำแพงหลัก' : 'พื้นที่จัดสรรใหม่',
        type: canvasMode as any,
        areaType: canvasMode === 'area' ? 'shop' : undefined,
        status: 'open',
        x: Math.round(coords.x - 75), // center shape on mouse
        y: Math.round(coords.y - 60),
        width: canvasMode === 'wall' ? 200 : 150,
        height: canvasMode === 'wall' ? 15 : 120,
        rotation: 0,
        layerId: canvasMode === 'wall' ? 'areas' : 'shops',
        zone: canvasMode === 'wall' ? 'Structure Zone' : 'Food Zone',
        tags: canvasMode === 'wall' ? ['structure', 'wall'] : ['area', 'shop'],
        label: canvasMode === 'area' ? 'S' + newId : undefined
      };

      addElement(newElement);
      setCanvasMode('select');
      e.preventDefault();
    }
  };

  // Mouse Down on Element
  const handleElementMouseDown = (e: React.MouseEvent, el: MapElement) => {
    if (previewMode) return;

    // Check if layer is locked
    const layer = layers.find(l => l.id === el.layerId);
    if (layer?.locked || el.locked) return;

    if (canvasMode === 'select' && e.button === 0) {
      e.stopPropagation(); // stop container pan triggering
      selectElement(el.id);

      setDragAction('move');
      const coords = getSVGCoords(e.clientX, e.clientY);
      dragStartMouse.current = { x: coords.x, y: coords.y };
      dragStartElementCoords.current = { x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation };
    }
  };

  // Handle Resize Mouse Down
  const handleResizeMouseDown = (e: React.MouseEvent, action: DragAction) => {
    if (!selectedElement) return;
    e.stopPropagation();

    setDragAction(action);
    const coords = getSVGCoords(e.clientX, e.clientY);
    dragStartMouse.current = { x: coords.x, y: coords.y };
    dragStartElementCoords.current = {
      x: selectedElement.x,
      y: selectedElement.y,
      w: selectedElement.width,
      h: selectedElement.height,
      r: selectedElement.rotation
    };
  };

  // Handle Rotate Mouse Down
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (!selectedElement) return;
    e.stopPropagation();

    setDragAction('rotate');
    // Calculate elements center
    const centerX = selectedElement.x + selectedElement.width / 2;
    const centerY = selectedElement.y + selectedElement.height / 2;

    // Store reference starting point
    dragStartElementCoords.current = {
      x: centerX,
      y: centerY,
      w: selectedElement.width,
      h: selectedElement.height,
      r: selectedElement.rotation
    };
  };

  // Mouse Move Event Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragAction === 'none') return;

    if (dragAction === 'pan') {
      const dx = e.clientX - dragStartMouse.current.x;
      const dy = e.clientY - dragStartMouse.current.y;
      setPan({
        x: dragStartPan.current.x + dx,
        y: dragStartPan.current.y + dy
      });
      return;
    }

    if (!selectedId || !selectedElement) return;
    const currentCoords = getSVGCoords(e.clientX, e.clientY);

    if (dragAction === 'move') {
      const dx = currentCoords.x - dragStartMouse.current.x;
      const dy = currentCoords.y - dragStartMouse.current.y;

      // Grid Snapping (snap to nearest 5 pixels for crisp alignments)
      const snapSize = 5;
      const newX = Math.round((dragStartElementCoords.current.x + dx) / snapSize) * snapSize;
      const newY = Math.round((dragStartElementCoords.current.y + dy) / snapSize) * snapSize;

      updateElement(selectedId, { x: newX, y: newY });
      return;
    }

    if (dragAction === 'rotate') {
      const centerX = dragStartElementCoords.current.x;
      const centerY = dragStartElementCoords.current.y;

      // Angle in radians between cursor and element center
      const rad = Math.atan2(currentCoords.y - centerY, currentCoords.x - centerX);
      let deg = Math.round((rad * 180) / Math.PI) - 90; // offset 90 so rotation starts pointing up
      if (deg < 0) deg += 360;

      // Snap to nearest 5 degrees if shift key is pressed
      if (e.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }

      updateElement(selectedId, { rotation: deg });
      return;
    }

    // Handles resizing
    const dx = currentCoords.x - dragStartMouse.current.x;
    const dy = currentCoords.y - dragStartMouse.current.y;
    const snapSize = 5;

    let newWidth = dragStartElementCoords.current.w;
    let newHeight = dragStartElementCoords.current.h;
    let newX = dragStartElementCoords.current.x;
    let newY = dragStartElementCoords.current.y;

    if (dragAction === 'resize-br') {
      newWidth = Math.max(10, Math.round((dragStartElementCoords.current.w + dx) / snapSize) * snapSize);
      newHeight = Math.max(10, Math.round((dragStartElementCoords.current.h + dy) / snapSize) * snapSize);
      updateElement(selectedId, { width: newWidth, height: newHeight });
    }
    else if (dragAction === 'resize-bl') {
      const targetW = dragStartElementCoords.current.w - dx;
      if (targetW > 10) {
        newWidth = Math.round(targetW / snapSize) * snapSize;
        newX = Math.round((dragStartElementCoords.current.x + dx) / snapSize) * snapSize;
      }
      newHeight = Math.max(10, Math.round((dragStartElementCoords.current.h + dy) / snapSize) * snapSize);
      updateElement(selectedId, { x: newX, width: newWidth, height: newHeight });
    }
    else if (dragAction === 'resize-tr') {
      newWidth = Math.max(10, Math.round((dragStartElementCoords.current.w + dx) / snapSize) * snapSize);
      const targetH = dragStartElementCoords.current.h - dy;
      if (targetH > 10) {
        newHeight = Math.round(targetH / snapSize) * snapSize;
        newY = Math.round((dragStartElementCoords.current.y + dy) / snapSize) * snapSize;
      }
      updateElement(selectedId, { y: newY, width: newWidth, height: newHeight });
    }
    else if (dragAction === 'resize-tl') {
      const targetW = dragStartElementCoords.current.w - dx;
      if (targetW > 10) {
        newWidth = Math.round(targetW / snapSize) * snapSize;
        newX = Math.round((dragStartElementCoords.current.x + dx) / snapSize) * snapSize;
      }
      const targetH = dragStartElementCoords.current.h - dy;
      if (targetH > 10) {
        newHeight = Math.round(targetH / snapSize) * snapSize;
        newY = Math.round((dragStartElementCoords.current.y + dy) / snapSize) * snapSize;
      }
      updateElement(selectedId, { x: newX, y: newY, width: newWidth, height: newHeight });
    }
  };

  // Mouse Up Event Handler
  const handleMouseUp = () => {
    setDragAction('none');
    if (containerRef.current) {
      containerRef.current.style.cursor = isSpacePressed ? 'grab' : 'default';
    }
  };

  // Render specific layout icons for room categories
  const renderUnitIcon = (el: MapElement) => {
    if (el.type === 'area' && el.areaType === 'other' && el.customAreaType?.toLowerCase().includes('stair')) {
      return (
        <g stroke="#cbd5e1" strokeWidth={2} fill="none" transform="translate(0, 0)">
          <path d={`M 10 10 L ${el.width - 10} 10`} />
          <path d={`M 10 25 L ${el.width - 10} 25`} />
          <path d={`M 10 40 L ${el.width - 10} 40`} />
          <path d={`M 10 55 L ${el.width - 10} 55`} />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 relative bg-[#f1f5f9]/60 select-none overflow-hidden h-full flex flex-col min-h-[500px]">
      {/* Canvas Tool options (Inside Canvas Bottom-Center Area) */}
      {!previewMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex bg-white/90 backdrop-blur-md border border-slate-200/80 p-1.5 rounded-2xl shadow-lg gap-1.5 text-slate-600 font-semibold text-xs select-none">
          {([
            { id: 'select', label: 'Select (เลือก)', icon: MousePointer },
            { id: 'wall', label: 'Wall (กำแพง)', icon: Square, iconStyle: 'text-slate-900 fill-slate-900 bg-slate-900 border border-slate-900 rounded-[2px] w-2.5 h-2.5' },
            { id: 'area', label: 'Area (พื้นที่)', icon: Square, iconStyle: 'text-[#f26522] fill-orange-50 bg-orange-50 border border-orange-200 rounded-[3px] w-3 h-3' },
          ] as const).map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setCanvasMode(tool.id)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${canvasMode === tool.id
                    ? 'bg-[#f26522] text-white shadow-sm'
                    : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900'
                  }`}
              >
                {tool.id === 'select' ? (
                  <Icon className="w-3.5 h-3.5" />
                ) : (
                  <span className={`inline-flex items-center justify-center shrink-0 ${tool.iconStyle}`} />
                )}
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Interaction Workspace Wrapper */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => {
          if (previewMode) return;
          e.preventDefault();
          const { x, y } = getSVGCoords(e.clientX, e.clientY);
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            canvasX: x,
            canvasY: y,
            elementId: null
          });
        }}
        className="w-full flex-1 relative overflow-hidden outline-none"
        style={{ touchAction: 'none' }}
      >
        {/* Infinite Background Grid SVG Pattern */}
        <div
          className="absolute inset-0 pointer-events-none transition-all"
          style={{
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)'
          }}
        />

        {/* Scaled & Panned Graphics Container */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          <defs>
            <filter id="wall-outline" x="-20%" y="-20%" width="140%" height="140%">
              <feMorphology operator="dilate" radius="2.5" in="SourceAlpha" result="dilated" />
              <feFlood floodColor="#0f172a" result="flood" />
              <feComposite in="flood" in2="dilated" operator="in" result="outline" />
              <feMerge>
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} className="pointer-events-auto">

            {/* 1. Filtered Wall Backgrounds Group */}
            <g filter="url(#wall-outline)">
              {elements
                .filter((el) => el.type === 'wall' && el.visible !== false && layers.find(l => l.id === el.layerId)?.visible !== false)
                .map((el) => (
                  <rect
                    key={`wall-bg-${el.id}`}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={el.fillColor || '#efefef'}
                    fillOpacity={0.85}
                    rx={0}
                    transform={`rotate(${el.rotation || 0} ${el.x + el.width / 2} ${el.y + el.height / 2})`}
                  />
                ))}
            </g>

            {/* SVG Elements Iteration */}
            {elements.map((el) => {
              const layer = layers.find(l => l.id === el.layerId);
              if (layer && !layer.visible) return null;
              if (el.visible === false) return null;

              const isSelected = el.id === selectedId;
              const isLocked = el.locked || layer?.locked;

              let fill = '#cbd5e1'; // default grey
              let stroke = '#475569';
              let fillOpacity = 0.85;
              let borderStrokeWidth = 2;

              if (el.type === 'wall') {
                fill = '#efefef'; // light grey structural floor/wall
                stroke = '#000000'; // black thick walls
                borderStrokeWidth = 4; // thick structural wall
              } else if (el.type === 'area') {
                if (el.areaType === 'shop') {
                  // custom theme: green for vacant/open, yellow for reserved, orange for occupied, grey for inactive
                  if (el.status === 'open') {
                    fill = '#d1fae5'; // light emerald
                    stroke = '#059669'; // emerald
                  } else if (el.status === 'occupied') {
                    fill = '#ffedd5'; // light orange
                    stroke = '#d97706'; // dark orange
                  } else if (el.status === 'reserved') {
                    fill = '#fef9c3'; // light yellow
                    stroke = '#ca8a04'; // gold
                  } else {
                    fill = '#f1f5f9'; // grey slate
                    stroke = '#64748b'; // slate
                  }
                } else if (el.areaType === 'toilet') {
                  fill = '#e0f2fe'; // distinct light sky blue
                  stroke = '#0284c7'; // ocean blue
                } else if (el.areaType === 'seating') {
                  fill = '#f8fafc'; // off-white dining floor
                  stroke = '#cbd5e1'; // slate boundary
                } else {
                  fill = '#cbd5e1'; // service gray
                  stroke = '#475569';
                }
              }

              return (
                <g
                  key={el.id}
                  transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0} ${el.width / 2} ${el.height / 2})`}
                  className="cursor-pointer group"
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  onClick={() => {
                    if (previewMode) {
                      selectElement(el.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    if (previewMode) return;
                    e.preventDefault();
                    e.stopPropagation();
                    selectElement(el.id);
                    const { x, y } = getSVGCoords(e.clientX, e.clientY);
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      canvasX: x,
                      canvasY: y,
                      elementId: el.id
                    });
                  }}
                  onMouseEnter={() => {
                    if (previewMode) setHoveredId(el.id);
                  }}
                  onMouseMove={(e) => {
                    if (previewMode && containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setHoverPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    if (previewMode) setHoveredId(null);
                  }}
                >
                  {/* Element shape outline */}
                  {el.type === 'wall' ? (
                    <rect
                      x={0}
                      y={0}
                      width={el.width}
                      height={el.height}
                      fill="#ffffff"
                      fillOpacity={0}
                      stroke="none"
                      rx={0}
                      pointerEvents="all"
                    />
                  ) : el.type === 'area' && el.areaType === 'seating' ? (() => {
                    const cellW = 85;
                    const cellH = 50;
                    const gapX = 35;
                    const gapY = 30;

                    const padL = 20;
                    const padR = 20;
                    const padT = 50; // space for the text label
                    const padB = 20;

                    const availW = el.width - padL - padR;
                    const availH = el.height - padT - padB;

                    const cols = Math.max(0, Math.floor((availW + gapX) / (cellW + gapX)));
                    const rows = Math.max(0, Math.floor((availH + gapY) / (cellH + gapY)));

                    const gridW = cols * cellW + (cols - 1) * gapX;
                    const gridH = rows * cellH + (rows - 1) * gapY;

                    const startX = padL + (availW - gridW) / 2;
                    const startY = padT + (availH - gridH) / 2;

                    return (
                      <g>
                        {/* Main Dining area boundary */}
                        <rect
                          x={0}
                          y={0}
                          width={el.width}
                          height={el.height}
                          fill="#f8fafc"
                          stroke="#cbd5e1"
                          strokeWidth={1.5}
                          strokeDasharray="6,4"
                          rx={8}
                        />

                        {/* Relative Dining Area Text Label */}
                        <text
                          x={el.width / 2}
                          y={25}
                          textAnchor="middle"
                          className="fill-slate-400 font-bold text-[10px] tracking-widest pointer-events-none select-none uppercase"
                        >
                          {el.name}
                        </text>

                        {/* Decorative Dining Table Grids */}
                        {cols > 0 && rows > 0 && Array.from({ length: cols }).map((_, colIdx) =>
                          Array.from({ length: rows }).map((_, rowIdx) => {
                            const colX = startX + colIdx * (cellW + gapX);
                            const rowY = startY + rowIdx * (cellH + gapY);
                            return (
                              <g key={`dec-l-${colIdx}-${rowIdx}`}>
                                {/* Top bench slat */}
                                <rect x={colX + 10} y={rowY} width={cellW - 20} height={5} fill="#94a3b8" rx={1.5} />
                                {/* Bottom bench slat */}
                                <rect x={colX + 10} y={rowY + cellH - 5} width={cellW - 20} height={5} fill="#94a3b8" rx={1.5} />
                                {/* Tabletop */}
                                <rect x={colX} y={rowY + 11} width={cellW} height={28} fill="#ffffff" stroke="#64748b" strokeWidth={1.2} rx={3} />
                              </g>
                            );
                          })
                        )}
                      </g>
                    );
                  })() : (
                    <rect
                      x={0}
                      y={0}
                      width={el.width}
                      height={el.height}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={stroke}
                      strokeWidth={borderStrokeWidth}
                      rx={el.id.startsWith('building-') ? 0 : 6}
                      className="shadow-sm"
                    />
                  )}

                  {/* Draw structural icons (e.g. toilet icon) */}
                  {renderUnitIcon(el)}

                  {/* Text labels inside the shape */}
                  {!(el.type === 'area' && el.areaType === 'seating') && el.width > 50 && el.height > 40 && (
                    <g className="pointer-events-none select-none">
                      {/* Name */}
                      <text
                        x={el.width / 2}
                        y={el.height / 2 + 3.5}
                        textAnchor="middle"
                        className="fill-slate-800 font-bold text-[10px] tracking-tight"
                      >
                        {el.name}
                      </text>
                    </g>
                  )}

                  {/* Lock Indicator badge inside shape if locked */}
                  {isLocked && !previewMode && (
                    <g transform="translate(8, 8)" fill="#94a3b8">
                      <rect width="14" height="14" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                      <Lock className="w-2.5 h-2.5 text-slate-400 absolute" style={{ transform: 'translate(2px, 2px)' }} />
                    </g>
                  )}
                </g>
              );
            })}

            {/* SELECTION OVERLAY BOUNDING BOX */}
            {selectedElement && !previewMode && (
              <g
                transform={`rotate(${selectedElement.rotation || 0} ${selectedElement.x + selectedElement.width / 2} ${selectedElement.y + selectedElement.height / 2})`}
                className="pointer-events-none"
              >
                {/* Active Selection outer outline */}
                <rect
                  x={selectedElement.x}
                  y={selectedElement.y}
                  width={selectedElement.width}
                  height={selectedElement.height}
                  fill="none"
                  stroke="#f26522"
                  strokeWidth={1.5}
                />

                {/* Draw corner handle indicators */}
                {[
                  { x: selectedElement.x, y: selectedElement.y, action: 'resize-tl' as DragAction, cursor: 'nwse-resize' },
                  { x: selectedElement.x + selectedElement.width, y: selectedElement.y, action: 'resize-tr' as DragAction, cursor: 'nesw-resize' },
                  { x: selectedElement.x, y: selectedElement.y + selectedElement.height, action: 'resize-bl' as DragAction, cursor: 'nesw-resize' },
                  { x: selectedElement.x + selectedElement.width, y: selectedElement.y + selectedElement.height, action: 'resize-br' as DragAction, cursor: 'nwse-resize' }
                ].map((handle, idx) => (
                  <rect
                    key={idx}
                    x={handle.x - 4}
                    y={handle.y - 4}
                    width={8}
                    height={8}
                    fill="#ffffff"
                    stroke="#f26522"
                    strokeWidth={1.5}
                    rx={1}
                    className="pointer-events-auto shadow-sm"
                    style={{ cursor: handle.cursor }}
                    onMouseDown={(e) => handleResizeMouseDown(e, handle.action)}
                  />
                ))}

                {/* Rotation Handle */}
                <line
                  x1={selectedElement.x + selectedElement.width / 2}
                  y1={selectedElement.y}
                  x2={selectedElement.x + selectedElement.width / 2}
                  y2={selectedElement.y - 15}
                  stroke="#f26522"
                  strokeWidth={1}
                />

                <circle
                  cx={selectedElement.x + selectedElement.width / 2}
                  cy={selectedElement.y - 15}
                  r={4.5}
                  fill="#ffffff"
                  stroke="#f26522"
                  strokeWidth={1.5}
                  className="pointer-events-auto shadow-sm"
                  style={{ cursor: 'grab' }}
                  onMouseDown={handleRotateMouseDown}
                />
              </g>
            )}

          </g>
        </svg>

        <svg className="hidden">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Custom Context Menu overlay */}
      {!previewMode && contextMenu && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-50 bg-[#F8F9FA] border border-slate-200 text-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[240px] flex flex-col gap-0.5 select-none"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          {contextMenu.elementId ? (() => {
            const el = elements.find(e => e.id === contextMenu.elementId);
            if (!el) return null;
            const isVisible = el.visible !== false;

            const originalIdx = elements.findIndex(e => e.id === el.id);
            const canMoveUp = originalIdx < elements.length - 1;
            const canMoveDown = originalIdx > 0;

            return (
              <>
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-slate-200 bg-white">
                  <p className="text-[9px] font-semibold tracking-widest text-[#f26522] uppercase">
                    {el.type === 'wall' ? 'Structure' : el.areaType || 'Area'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-800 truncate mt-1">
                    {el.name}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    ID: {el.id}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-1.5 bg-slate-50/50">
                  {/* Duplicate */}
                  <button
                    onClick={() => {
                      const newId = String(Math.floor(Math.random() * 1000) + 200);
                      const duplicate: MapElement = {
                        ...el,
                        id: newId,
                        name: `${el.name} Copy`,
                        x: el.x + 30,
                        y: el.y + 30,
                        locked: false,
                      };
                      addElement(duplicate);
                      selectElement(newId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Duplicate (ทำซ้ำ)</span>
                  </button>

                  {/* Lock */}
                  <button
                    onClick={() => {
                      updateElement(el.id, { locked: !el.locked });
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    {el.locked ? (
                      <>
                        <Unlock className="w-4 h-4 text-amber-500" />
                        <span>Unlock (ปลดล็อค)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Lock Position (ล็อคตำแหน่ง)</span>
                      </>
                    )}
                  </button>

                  {/* Visibility */}
                  <button
                    onClick={() => {
                      updateElement(el.id, { visible: !isVisible });
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                  >
                    {isVisible ? (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-400" />
                        <span>Hide (ซ่อน)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-[#f26522]" />
                        <span>Show (แสดง)</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="my-1.5 border-t border-slate-200" />

                  {/* Arrange Label */}
                  <div className="px-3 pb-1">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      Arrange (จัดลำดับ)
                    </p>
                  </div>

                  {/* Bring to Front */}
                  <button
                    onClick={() => {
                      reorderElement(el.id, 'front');
                      setContextMenu(null);
                    }}
                    disabled={!canMoveUp}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all
                      ${canMoveUp ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                  >
                    <ChevronsUp className="w-4 h-4 text-slate-400" />
                    <span>Bring to Front (ไว้หน้าสุด)</span>
                  </button>

                  {/* Move Forward */}
                  <button
                    onClick={() => {
                      reorderElement(el.id, 'up');
                      setContextMenu(null);
                    }}
                    disabled={!canMoveUp}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all
                      ${canMoveUp ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                  >
                    <ArrowUp className="w-4 h-4 text-slate-400" />
                    <span>Move Forward (เลื่อนขึ้นหน้า)</span>
                  </button>

                  {/* Move Backward */}
                  <button
                    onClick={() => {
                      reorderElement(el.id, 'down');
                      setContextMenu(null);
                    }}
                    disabled={!canMoveDown}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all
                      ${canMoveDown ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                  >
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                    <span>Move Backward (เลื่อนลงหลัง)</span>
                  </button>

                  {/* Send to Back */}
                  <button
                    onClick={() => {
                      reorderElement(el.id, 'back');
                      setContextMenu(null);
                    }}
                    disabled={!canMoveDown}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-all
                      ${canMoveDown ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                  >
                    <ChevronsDown className="w-4 h-4 text-slate-400" />
                    <span>Send to Back (ไว้หลังสุด)</span>
                  </button>

                  {/* Divider */}
                  <div className="my-1.5 border-t border-slate-200" />

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`ต้องการลบ "${el.name}" หรือไม่?`)) {
                        deleteElement(el.id);
                      }
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete (ลบออก)</span>
                  </button>
                </div>
              </>
            );
          })() : (
            <>
              <div className="px-2.5 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-0.5 bg-white">
                Canvas Options
              </div>

              <div className="p-1.5 bg-slate-50/50">
                {/* Add Wall here */}
                <button
                  onClick={() => {
                    const newId = String(Math.floor(Math.random() * 1000) + 200);
                    const newElement: MapElement = {
                      id: newId,
                      name: 'แนวกำแพงใหม่',
                      type: 'wall',
                      status: 'open',
                      x: Math.round(contextMenu.canvasX - 100),
                      y: Math.round(contextMenu.canvasY - 7.5),
                      width: 200,
                      height: 15,
                      rotation: 0,
                      layerId: 'areas',
                      zone: 'Structure Zone',
                      tags: ['structure', 'wall']
                    };
                    addElement(newElement);
                    selectElement(newId);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-left transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
                  <span>Add Wall (สร้างกำแพง)</span>
                </button>

                {/* Add Area here */}
                <button
                  onClick={() => {
                    const newId = String(Math.floor(Math.random() * 1000) + 200);
                    const newElement: MapElement = {
                      id: newId,
                      name: 'พื้นที่จัดสรรใหม่',
                      type: 'area',
                      areaType: 'shop',
                      status: 'open',
                      x: Math.round(contextMenu.canvasX - 75),
                      y: Math.round(contextMenu.canvasY - 60),
                      width: 150,
                      height: 120,
                      rotation: 0,
                      layerId: 'shops',
                      zone: 'Food Zone',
                      tags: ['area', 'shop'],
                      label: 'S' + newId
                    };
                    addElement(newElement);
                    selectElement(newId);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-left transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 text-[#f26522] fill-orange-50 border border-orange-200 rounded-[3px]" />
                  <span>Add Area (สร้างแผงร้านค้า)</span>
                </button>

                {/* Reset Pan / Zoom */}
                <div className="border-t border-slate-200 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setPan({ x: 20, y: -80 });
                      setScale(0.8);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg text-left transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset View (รีเซ็ตมุมมอง)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-lg pointer-events-auto">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm border border-slate-100 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold font-mono text-slate-600 w-12 text-center select-none">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm border border-slate-100 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

        <button
          onClick={handleResetZoom}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm border border-slate-100 cursor-pointer"
          title="Reset Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Hover Preview Tooltip in Preview Mode */}
      {previewMode && hoveredId && (() => {
        const hoveredEl = elements.find(e => e.id === hoveredId);
        if (!hoveredEl) return null;

        const statusConfig: Record<string, { label: string; bg: string }> = {
          open: { label: 'ว่าง (Vacant)', bg: 'bg-emerald-500' },
          reserved: { label: 'จองแล้ว (Reserved)', bg: 'bg-amber-500' },
          occupied: { label: 'มีผู้เช่า (Occupied)', bg: 'bg-rose-500' },
          maintenance: { label: 'ปรับปรุง (Maintenance)', bg: 'bg-orange-500' },
          unavailable: { label: 'ปิดใช้งาน (Unavailable)', bg: 'bg-slate-400' }
        };

        const config = statusConfig[hoveredEl.status] || { label: hoveredEl.status, bg: 'bg-slate-400' };

        return (
          <div
            className="absolute z-30 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl pointer-events-none max-w-[260px] select-none border border-slate-800"
            style={{
              left: `${hoverPos.x + 15}px`,
              top: `${hoverPos.y + 15}px`
            }}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${config.bg} shrink-0`} />
              <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">
                {hoveredEl.type === 'wall' ? 'Wall Structure' : hoveredEl.areaType || 'Area'}
              </span>
              <span className="text-[9px] text-slate-500 font-mono ml-auto">
                ID: {hoveredEl.id}
              </span>
            </div>
            <h4 className="font-bold text-xs text-white mt-1.5 leading-snug">
              {hoveredEl.name}
            </h4>
            {hoveredEl.tenant && (
              <p className="text-[10px] font-semibold text-orange-300 mt-0.5">
                ผู้เช่า: {hoveredEl.tenant}
              </p>
            )}
            {hoveredEl.description && (
              <p className="text-[9px] text-slate-400 mt-2 border-t border-slate-800 pt-2 leading-relaxed">
                {hoveredEl.description}
              </p>
            )}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-3 pt-1.5 border-t border-slate-800/80">
              <span>สถานะ:</span>
              <span className={`${config.bg} text-white px-2 py-0.5 rounded text-[8px]`}>
                {config.label}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
