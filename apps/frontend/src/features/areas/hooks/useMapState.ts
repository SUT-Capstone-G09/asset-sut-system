import { useState, useCallback, useRef } from 'react';
import { MapElement, MapLayer, CanvasMode } from '@/features/areas/types/floor-plan';

const DEFAULT_LAYERS: MapLayer[] = [
  { id: 'shops', name: 'ร้านค้า (Shops)', visible: true, locked: false, color: '#6366f1' },
  { id: 'toilet', name: 'ห้องน้ำ (Restrooms)', visible: true, locked: false, color: '#10b981' },
  { id: 'areas', name: 'พื้นที่ส่วนกลาง (Areas)', visible: true, locked: false, color: '#f59e0b' }
];

const DEFAULT_ELEMENTS: MapElement[] = [
  // 0. Structural Background Borders (unlocked & fully editable Area elements!)
  {
    id: 'building-main',
    name: 'โครงสร้างอาคารหลัก',
    type: 'wall',
    status: 'open',
    x: 50,
    y: 150,
    width: 935,
    height: 700,
    rotation: 0,
    layerId: 'areas',
    zone: 'Structure Zone',
    description: 'แนวกำแพงหลักและโครงสร้างของโรงอาหาร',
    tags: ['structure', 'wall'],
    fillColor: '#efefef',
    strokeColor: '#000000'
  },
  {
    id: 'building-restroom',
    name: 'โครงสร้างอาคารห้องน้ำ',
    type: 'wall',
    status: 'open',
    x: 50,
    y: 10,
    width: 300,
    height: 140,
    rotation: 0,
    layerId: 'areas',
    zone: 'Structure Zone',
    description: 'กำแพงขอบส่วนต่อยื่นขึ้นไปของห้องน้ำ',
    tags: ['structure', 'wall'],
    fillColor: '#efefef',
    strokeColor: '#000000'
  },

  // 1. Restrooms (toilet layer, green theme - highly distinct pastel green)
  {
    id: 'toilet-1',
    name: 'ห้องน้ำชาย',
    type: 'area',
    areaType: 'toilet',
    status: 'open',
    x: 60,
    y: 80,
    width: 140,
    height: 220,
    rotation: 0,
    layerId: 'toilet',
    zone: 'Restroom Zone',
    description: 'ห้องน้ำสำหรับสุภาพบุรุษ',
    tags: ['toilet', 'restroom'],
    fillColor: '#a7f3d0', // distinct light emerald green
    strokeColor: '#059669'  // dark forest green border
  },
  {
    id: 'toilet-2',
    name: 'ห้องน้ำหญิง',
    type: 'area',
    areaType: 'toilet',
    status: 'open',
    x: 200,
    y: 80,
    width: 120,
    height: 220,
    rotation: 0,
    layerId: 'toilet',
    zone: 'Restroom Zone',
    description: 'ห้องน้ำสำหรับสุภาพสตรี',
    tags: ['toilet', 'restroom'],
    fillColor: '#a7f3d0', // distinct light emerald green
    strokeColor: '#059669'  // dark forest green border
  },

  // 2. Food Stalls (shops layer, blue theme - highly distinct pastel blue)
  {
    id: 'stall-1',
    name: 'น้ำหวาน/ส้มตำ',
    type: 'area',
    areaType: 'shop',
    status: 'open',
    x: 350,
    y: 150,
    width: 210,
    height: 150,
    rotation: 0,
    layerId: 'shops',
    zone: 'Food Zone',
    tenant: 'ร้านน้ำหวาน & ส้มตำรสเด็ด',
    description: 'จำหน่ายน้ำหวาน ชา กาแฟ และส้มตำรสชาติแซ่บจัดจ้าน',
    tags: ['food', 'somtam', 'drinks'],
    fillColor: '#bfdbfe', // distinct sky blue
    strokeColor: '#1d4ed8'  // deep blue border
  },
  {
    id: 'stall-2',
    name: 'ข้าวราดแกง',
    type: 'area',
    areaType: 'shop',
    status: 'open',
    x: 560,
    y: 150,
    width: 210,
    height: 150,
    rotation: 0,
    layerId: 'shops',
    zone: 'Food Zone',
    tenant: 'ร้านข้าวราดแกงปักษ์ใต้',
    description: 'ข้าวแกงรสเด็ด เมนูหลากหลาย ทำสดใหม่ทุกวัน',
    tags: ['food', 'rice', 'curry'],
    fillColor: '#bfdbfe', // distinct sky blue
    strokeColor: '#1d4ed8'  // deep blue border
  },
  {
    id: 'stall-3',
    name: 'ก๋วยเตี๋ยว/ข้าวมันไก่',
    type: 'area',
    areaType: 'shop',
    status: 'open',
    x: 770,
    y: 150,
    width: 210,
    height: 150,
    rotation: 0,
    layerId: 'shops',
    zone: 'Food Zone',
    tenant: 'ข้าวมันไก่ตอน & ก๋วยเตี๋ยวต้มยำ',
    description: 'ข้าวมันไก่เนื้อนุ่ม น้ำจิ้มรสเด็ด และก๋วยเตี๋ยวต้มยำโบราณ',
    tags: ['food', 'chicken-rice', 'noodles'],
    fillColor: '#bfdbfe', // distinct sky blue
    strokeColor: '#1d4ed8'  // deep blue border
  },

  // 3. Central Dining Area (area layer, yellow theme, dashed boundary)
  {
    id: 'dining-area',
    name: 'พื้นที่ทานอาหาร',
    type: 'area',
    areaType: 'seating',
    status: 'open',
    x: 140,
    y: 380,
    width: 750,
    height: 400,
    rotation: 0,
    layerId: 'areas',
    zone: 'Dining Zone',
    description: 'พื้นที่ส่วนกลางสำหรับนั่งรับประทานอาหาร',
    tags: ['dining', 'central'],
    fillColor: '#f8fafc', // ultra-clean grey slate
    strokeColor: '#64748b', // distinct slate border boundary
    locked: false // unlocked so they can move/resize/adjust it freely!
  },

  // 4. Device & Badge (area layer - bright warnings highlight)
  {
    id: 'device-29',
    name: '29 Device',
    type: 'area',
    areaType: 'other',
    customAreaType: 'Sensor',
    status: 'reserved',
    x: 235,
    y: 310,
    width: 80,
    height: 25,
    rotation: 0,
    layerId: 'areas',
    zone: 'Sensor Zone',
    description: 'ตัวเก็บข้อมูลอุปกรณ์ 29 Device',
    tags: ['device', 'sensor'],
    fillColor: '#fef08a', // bright yellow fill
    strokeColor: '#ca8a04'  // gold border
  },
  {
    id: 'badge-nocode',
    name: 'ไม่มีรหัส',
    type: 'area',
    areaType: 'other',
    customAreaType: 'Sensor',
    status: 'open',
    x: 235,
    y: 340,
    width: 80,
    height: 25,
    rotation: 0,
    layerId: 'areas',
    zone: 'Sensor Zone',
    description: 'อุปกรณ์ไม่มีรหัสลงทะเบียน',
    tags: ['device', 'unregistered'],
    fillColor: '#fed7aa', // bright orange fill (separating from blue shops!)
    strokeColor: '#ea580c'  // intense orange border
  },

  // 5. Tray Stations (area layer, solid slate gray theme)
  {
    id: 'tray-left',
    name: 'ที่เก็บภาชนะ (ฝั่งซ้าย)',
    type: 'area',
    areaType: 'other',
    customAreaType: 'Service',
    status: 'open',
    x: 55,
    y: 580,
    width: 60,
    height: 250,
    rotation: 0,
    layerId: 'areas',
    zone: 'Service Zone',
    description: 'จุดส่งคืนจานและเก็บภาชนะ ฝั่งซ้าย',
    tags: ['service', 'tray'],
    fillColor: '#cbd5e1', // distinct slate gray
    strokeColor: '#475569'  // dark charcoal border
  },
  {
    id: 'tray-right',
    name: 'ที่เก็บภาชนะ (ฝั่งขวา)',
    type: 'area',
    areaType: 'other',
    customAreaType: 'Service',
    status: 'open',
    x: 915,
    y: 470,
    width: 60,
    height: 250,
    rotation: 0,
    layerId: 'areas',
    zone: 'Service Zone',
    description: 'จุดส่งคืนจานและเก็บภาชนะ ฝั่งขวา',
    tags: ['service', 'tray'],
    fillColor: '#cbd5e1', // distinct slate gray
    strokeColor: '#475569'  // dark charcoal border
  }
];

export function useMapState(initialElements?: MapElement[], initialLayers?: MapLayer[]) {
  const [elements, setElements] = useState<MapElement[]>(initialElements || DEFAULT_ELEMENTS);
  const [layers, setLayers] = useState<MapLayer[]>(initialLayers || DEFAULT_LAYERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('select');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  // Viewport navigation
  const [scale, setScale] = useState<number>(0.8); // 80% default to fit beautifully
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: -80 });

  // Undo/Redo stacks
  const historyRef = useRef<MapElement[][]>([initialElements || DEFAULT_ELEMENTS]);
  const historyIndexRef = useRef<number>(0);

  const saveToHistory = useCallback((newElements: MapElement[]) => {
    const updatedHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    updatedHistory.push(newElements);
    historyRef.current = updatedHistory;
    historyIndexRef.current = updatedHistory.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setElements(historyRef.current[historyIndexRef.current]);
      setSelectedId(null);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setElements(historyRef.current[historyIndexRef.current]);
      setSelectedId(null);
    }
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<MapElement>) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const addElement = useCallback((element: MapElement) => {
    setElements(prev => {
      const next = [...prev, element];
      saveToHistory(next);
      return next;
    });
    setSelectedId(element.id);
    setCanvasMode('select'); // revert back to select
  }, [saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => {
      const next = prev.filter(el => el.id !== id);
      saveToHistory(next);
      return next;
    });
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId, saveToHistory]);

  const reorderElement = useCallback((id: string, action: 'up' | 'down' | 'front' | 'back') => {
    setElements(prev => {
      const index = prev.findIndex(el => el.id === id);
      if (index === -1) return prev;

      const next = [...prev];
      if (action === 'front') {
        const [el] = next.splice(index, 1);
        next.push(el);
      } else if (action === 'back') {
        const [el] = next.splice(index, 1);
        next.unshift(el);
      } else if (action === 'up') {
        if (index < next.length - 1) {
          const temp = next[index];
          next[index] = next[index + 1];
          next[index + 1] = temp;
        }
      } else if (action === 'down') {
        if (index > 0) {
          const temp = next[index];
          next[index] = next[index - 1];
          next[index - 1] = temp;
        }
      }
      
      saveToHistory(next);
      return next;
    });
  }, [saveToHistory]);

  const selectElement = useCallback((id: string | null) => {
    if (canvasMode !== 'select') return;
    
    if (id === null) {
      setSelectedId(null);
      return;
    }

    const element = elements.find(el => el.id === id);
    if (!element) return;

    // Check if the element's layer is locked
    const layer = layers.find(l => l.id === element.layerId);
    if (layer?.locked || element.locked) return;

    setSelectedId(id);
  }, [canvasMode, elements, layers]);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(ly => ly.id === layerId ? { ...ly, visible: !ly.visible } : ly));
    // Clear selection if selected element's layer is hidden
    setElements(prev => {
      const activeEl = prev.find(e => e.id === selectedId);
      if (activeEl?.layerId === layerId) {
        setSelectedId(null);
      }
      return prev;
    });
  }, [selectedId]);

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(ly => ly.id === layerId ? { ...ly, locked: !ly.locked } : ly));
    // Clear selection if selected element's layer is locked
    setElements(prev => {
      const activeEl = prev.find(e => e.id === selectedId);
      if (activeEl?.layerId === layerId) {
        setSelectedId(null);
      }
      return prev;
    });
  }, [selectedId]);

  const addLayer = useCallback((layer: MapLayer) => {
    setLayers(prev => [...prev, layer]);
  }, []);

  const resetPanZoom = useCallback(() => {
    setScale(0.8);
    setPan({ x: 20, y: -80 });
  }, []);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('map_admin_elements_simple_v6', JSON.stringify(elements));
      localStorage.setItem('map_admin_layers_simple_v6', JSON.stringify(layers));
      alert('Floor plan saved to local storage!');
    } catch (e) {
      console.error(e);
      alert('Failed to save floor plan.');
    }
  }, [elements, layers]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedElements = localStorage.getItem('map_admin_elements_simple_v6');
      const savedLayers = localStorage.getItem('map_admin_layers_simple_v6');
      if (savedElements) {
        setElements(JSON.parse(savedElements));
        historyRef.current = [JSON.parse(savedElements)];
        historyIndexRef.current = 0;
      }
      if (savedLayers) {
        setLayers(JSON.parse(savedLayers));
      }
      setSelectedId(null);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const exportToJson = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ elements, layers }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "floor_plan_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [elements, layers]);

  return {
    elements,
    layers,
    selectedId,
    canvasMode,
    previewMode,
    scale,
    pan,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    
    setElements,
    setLayers,
    setCanvasMode,
    setPreviewMode,
    setScale,
    setPan,
    
    undo,
    redo,
    selectElement,
    updateElement,
    addElement,
    deleteElement,
    reorderElement,
    toggleLayerVisibility,
    toggleLayerLock,
    addLayer,
    resetPanZoom,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportToJson
  };
}
