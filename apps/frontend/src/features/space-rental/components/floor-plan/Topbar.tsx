import React from 'react';
import { 
  Undo2, Redo2, Maximize2, Eye, EyeOff, Save, ArrowLeft
} from 'lucide-react';

interface TopbarProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  saveChanges: () => void;
  resetView: () => void;
  locationName?: string;
  onBack?: () => void;
}

export default function Topbar({
  canUndo,
  canRedo,
  undo,
  redo,
  previewMode,
  setPreviewMode,
  saveChanges,
  resetView,
  locationName = "Floor Plan Editor",
  onBack
}: TopbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 select-none shrink-0 w-full">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer mr-1"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight">
            {locationName}
          </h1>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Saved</span>
          </div>
        </div>

        {/* Action Tools & Buttons */}
        <div className="flex items-center gap-4">
          {!previewMode && (
            <div className="flex items-center bg-transparent border border-slate-200 rounded-lg p-0.5">
              {/* Undo */}
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
                className={`p-1.5 rounded-md transition-all ${
                  canUndo 
                    ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer' 
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              {/* Redo */}
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
                className={`p-1.5 rounded-md transition-all ${
                  canRedo 
                    ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer' 
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200 mx-1" />

              {/* Fit Screen / Reset view */}
              <button
                onClick={resetView}
                title="Reset Pan & Zoom"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Preview */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all border cursor-pointer ${
                previewMode
                  ? 'bg-orange-50 border-orange-200 text-[#f26522]'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {previewMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Exit Preview (แก้ไขแปลน)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview (แสดงผลจริง)</span>
                </>
              )}
            </button>

            {/* Save */}
            <button
              onClick={saveChanges}
              className="flex items-center gap-1.5 bg-[#f26522] hover:bg-[#d8561d] text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save (บันทึกผัง)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
