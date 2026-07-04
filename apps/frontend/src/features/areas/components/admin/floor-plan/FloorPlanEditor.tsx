"use client"

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { FloorPlanData } from "@/features/areas/types/floor-plan";
import { useMapState } from "@/features/areas/hooks/useMapState";
import Topbar from "./Topbar";
import LayersPanel from "./LayersPanel";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import ObjectPalette from "./ObjectPalette";

interface FloorPlanEditorProps {
  initialData: FloorPlanData;
  onSave: (data: FloorPlanData) => void;
  onBack?: () => void;
}

export default function FloorPlanEditor({
  initialData,
  onSave,
  onBack,
}: FloorPlanEditorProps) {
  const {
    elements,
    layers,
    selectedId,
    canvasMode,
    previewMode,
    scale,
    pan,
    canUndo,
    canRedo,
    
    setElements,
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
    resetPanZoom,
  } = useMapState(initialData.elements, initialData.layers);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // จำลองการเชื่อมต่อบันทึกข้อมูล
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedData: FloorPlanData = {
      ...initialData,
      elements: [...elements],
      layers: [...layers],
      updatedAt: new Date().toISOString(),
    };

    // บันทึกลง LocalStorage
    const stored = localStorage.getItem("floor-plans");
    const all: FloorPlanData[] = stored ? JSON.parse(stored) : [];
    const idx = all.findIndex((fp) => fp.id === updatedData.id);
    if (idx >= 0) all[idx] = updatedData;
    else all.push(updatedData);
    localStorage.setItem("floor-plans", JSON.stringify(all));

    onSave(updatedData);
    setIsSaving(false);
  };

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  return (
    <div className="flex flex-col h-[75vh] min-h-[650px] bg-slate-50 border border-slate-200/80 rounded-[7px] overflow-hidden relative">
      {/* Header controls bar */}
      <Topbar
        canUndo={canUndo}
        canRedo={canRedo}
        undo={undo}
        redo={redo}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        saveChanges={handleSave}
        resetView={resetPanZoom}
        locationName={initialData.name}
        onBack={onBack}
      />

      {/* Workspace Area Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Adding Objects Panel */}
        {!previewMode && (
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-5 shrink-0 overflow-y-auto custom-scrollbar">
            <ObjectPalette
              onAddElement={(type) => setCanvasMode(type as any)}
              canvasMode={canvasMode}
              setCanvasMode={setCanvasMode}
            />
          </aside>
        )}

        {/* Layers control panel */}
        {!previewMode && (
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            selectElement={selectElement}
            updateElement={updateElement}
            deleteElement={deleteElement}
            reorderElement={reorderElement}
          />
        )}

        {/* Design board workspace */}
        <div className="flex-1 relative h-full">
          <Canvas
            elements={elements}
            layers={layers}
            selectedId={selectedId}
            canvasMode={canvasMode}
            scale={scale}
            pan={pan}
            selectElement={selectElement}
            updateElement={updateElement}
            deleteElement={deleteElement}
            addElement={addElement}
            reorderElement={reorderElement}
            setCanvasMode={setCanvasMode}
            setScale={setScale}
            setPan={setPan}
            previewMode={previewMode}
          />
        </div>

        {/* Inspector panel */}
        {!previewMode && (
          <PropertiesPanel
            element={selectedElement}
            layers={layers}
            updateElement={updateElement}
            deleteElement={deleteElement}
          />
        )}
      </div>

      {/* Save indicator overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[250] transition-all duration-300">
          <div className="bg-white/95 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 border border-slate-100 max-w-[200px]">
            <Loader2 className="w-8 h-8 text-[#f26522] animate-spin" />
            <p className="text-xs font-black text-slate-700 tracking-tight text-center">
              กำลังบันทึกโครงสร้าง...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
