import { FileDropzone, ExistingFile } from "@/components/ui/MultiDropZone";

export interface ReceiptSectionProps {
  receiptFile: File | null;
  receiptUrl?: string;
  onFileChange: (file: File | null) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</p>
  );
}

export function ReceiptSection({
  receiptFile, receiptUrl, onFileChange,
}: ReceiptSectionProps) {

  // We represent the existing receipt url as an existing file if no new file is uploaded
  const existingFiles: ExistingFile[] = (!receiptFile && receiptUrl)
    ? [{ id: "existing", name: "ใบเสร็จเดิม", url: receiptUrl }]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>ใบเสร็จรับเงิน</SectionLabel>
      </div>

      <FileDropzone
        files={receiptFile ? [receiptFile] : []}
        onFilesChange={(files) => onFileChange(files[0] || null)}
        existingFiles={existingFiles}
        onExistingFileRemove={() => { }} // Remove is handled by replacing the file in this context
        accept="application/pdf,image/png,image/jpeg,image/webp"
        maxSizeMB={10}
        hint="PDF, PNG, JPG · ไม่เกิน 10MB"
        multiple={false}
      />
    </div>
  );
}
