"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  FileUp,
  FilePen,
  MapPin,
  Mic,
  PenLine,
  Utensils,
  Users,
  Video,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Room } from "@/features/bookings/types";
import { EQUIPMENT_LIST } from "@/features/bookings/data/mock-equipment";
import { cn } from "@/lib/utils";
import Link from "next/link";

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  video: Video,
  mic: Mic,
  "pen-line": PenLine,
  utensils: Utensils,
};

const STEPS = [
  { label: "เริ่มต้นการจอง", description: "กรอกข้อมูลเบื้องต้นเรียบร้อยแล้ว", done: true },
  { label: "รอดำเนินการอนุมัติ", description: "คำขอจะได้รับการตรวจสอบโดยผู้ดูแล", done: false },
  { label: "รอชำระเงิน", description: "ชำระผ่านช่องทางต่างๆ ของมหาวิทยาลัย", done: false },
  { label: "เสร็จสิ้น", description: "การจองของคุณเสร็จสมบูรณ์", done: false },
];

interface BookingConfirmViewProps {
  room: Room;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BookingConfirmView({ room }: BookingConfirmViewProps) {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generateDoc, setGenerateDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasDocument = uploadedFiles.length > 0 || generateDoc;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));


  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สรุปรายละเอียดการจอง</h1>
        <p className="text-gray-500 text-sm mt-1">ตรวจสอบข้อมูลการจองห้องประชุมและอุปกรณ์เสริมของคุณ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Room info */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader icon="door" label="ข้อมูลห้องที่เลือก" />
            <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden flex gap-0">
              <div className="w-40 shrink-0">
                <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-2 p-4">
                <h3 className="text-lg font-bold text-brand-primary">{room.name}</h3>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={13} className="text-brand-primary shrink-0" />
                  {[room.building, room.floor].filter(Boolean).join(" ")}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <Users size={11} /> {room.capacityMax} ที่นั่ง
                  </span>
                  {room.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      <Wifi size={11} /> {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Equipment */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader icon="equipment" label="อุปกรณ์เพิ่มเติม" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EQUIPMENT_LIST.map((eq) => {
                const Icon = EQUIPMENT_ICONS[eq.icon];
                return (
                  <div
                    key={eq.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shrink-0">
                      {Icon && <Icon size={16} className="text-brand-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{eq.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{eq.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Document management */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader icon="document" label="การจัดการเอกสาร" />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocCard
                icon={<FileUp size={28} className="text-brand-primary" />}
                title="อัปโหลดเอกสาร"
                description="สำหรับผู้ที่มีเอกสารพร้อมแล้ว"
                selected={uploadedFiles.length > 0}
                onClick={() => fileInputRef.current?.click()}
              />
              <DocCard
                icon={<FilePen size={28} className="text-brand-primary" />}
                title="สร้างเอกสารผ่านระบบ"
                description="สร้างไฟล์ PDF อัตโนมัติจากข้อมูลการจอง"
                selected={generateDoc}
                onClick={() => setGenerateDoc((v) => !v)}
              />
            </div>

            {/* Uploaded file list */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-4">
          {/* Status stepper */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">สถานะการจอง</h3>
            <div className="flex flex-col">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                      step.done
                        ? "bg-brand-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    )}>
                      {step.done ? <Check size={14} strokeWidth={3} /> : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={cn(
                      "text-sm font-semibold",
                      step.done ? "text-brand-primary" : "text-gray-400"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
              <Link href="/payment" className="w-full">
                <Button
                  disabled={!hasDocument}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold h-12 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยืนยันการจอง
                </Button>
              </Link>
            {!hasDocument && (
              <p className="text-xs text-red-400 text-center">
                กรุณาอัปโหลดเอกสารหรือสร้างเอกสารก่อนยืนยัน
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full h-12 rounded-xl text-base font-medium border-gray-200 text-gray-600 hover:text-gray-900"
          >
            ย้อนกลับ
          </Button>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
            <span className="text-orange-500 mt-0.5 shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-1">ข้อมูลสำคัญ</p>
              <p className="text-xs text-orange-600 leading-relaxed">
                การยกเลิกการจองต้องทำล่วงหน้าอย่างน้อย 24 ชั่วโมง
                เพื่อรับเงินคืนเต็มจำนวน หากยกเลิกหลังจากนั้นระบบจะหักค่าธรรมเนียม 50%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  const colors: Record<string, string> = {
    door: "bg-orange-100 text-brand-primary",
    equipment: "bg-orange-100 text-brand-primary",
    document: "bg-orange-100 text-brand-primary",
  };
  const icons: Record<string, React.ElementType> = {
    door: Users,
    equipment: Wifi,
    document: FilePen,
  };
  const Icon = icons[icon];
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", colors[icon])}>
        {Icon && <Icon size={14} />}
      </div>
      <h2 className="font-bold text-gray-900">{label}</h2>
    </div>
  );
}

function DocCard({ icon, title, description, selected, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
        selected
          ? "border-brand-primary/30 bg-orange-50"
          : "border-gray-100 bg-gray-50 hover:border-brand-primary/30 hover:bg-orange-50"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
