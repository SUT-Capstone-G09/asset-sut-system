import React from "react";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsFileCardProps {
  name: string;
  size: number;
  type: "image" | "pdf";
  previewUrl?: string;
  onRemove: () => void;
}

export const NewsFileCard: React.FC<NewsFileCardProps> = ({
  name,
  size,
  type,
  previewUrl,
  onRemove,
}) => {
  const formattedSize = (size / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className="border border-zinc-200 rounded-xl p-4 flex items-center justify-between bg-white shadow-sm w-full">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 flex items-center justify-center">
          {type === "image" && previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : type === "image" ? (
            <ImageIcon className="w-8 h-8 text-zinc-400" />
          ) : (
            <div className="w-full h-full bg-orange-50 flex items-center justify-center border border-orange-100 rounded-lg">
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-zinc-800 truncate max-w-[180px] sm:max-w-xs">{name}</div>
          <div className="text-xs text-zinc-500">{formattedSize}</div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
};
