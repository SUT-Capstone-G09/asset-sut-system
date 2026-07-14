"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import {
  createHallUsagePurpose,
  getHallUsagePurposes,
  updateHallUsagePurpose,
} from "../../services/hallPricingService";
import { HallPricingModel, HallUsagePurpose } from "../../types/pricing";

interface Props {
  open: boolean;
  // แจ้ง parent ให้โหลดข้อมูลราคาใหม่ เมื่อรายการวัตถุประสงค์เปลี่ยน (แถวราคาจะได้อัปเดตตาม)
  onChanged: () => void;
}

const MODELS: { value: HallPricingModel; label: string; unit: string }[] = [
  { value: "per_sqm", label: "ตามพื้นที่ (ตร.ม.)", unit: "บาท / ตร.ม. / วัน" },
  { value: "per_type_per_day", label: "ต่อประเภท/วัน", unit: "บาท / ประเภท / วัน" },
];

const modelMeta = (m: HallPricingModel) =>
  MODELS.find((x) => x.value === m) ?? MODELS[0];

export default function HallPurposesTab({ open, onChanged }: Props) {
  const [purposes, setPurposes] = useState<HallUsagePurpose[]>([]);
  const [initialized, setInitialized] = useState(false);

  // ฟอร์มเพิ่มใหม่
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<HallPricingModel>("per_type_per_day");
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await getHallUsagePurposes(true);
        if (!active) return;
        setPurposes(data);
        setInitialized(true);
      } catch (err) {
        if (!active) return;
        console.error("Failed to load purposes:", err);
        setError("โหลดรายการวัตถุประสงค์ไม่สำเร็จ");
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const showLoading = open && !initialized && !error;

  const resetForm = () => {
    setName("");
    setDescription("");
    setModel("per_type_per_day");
    setDefaultPrice(0);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("กรุณากรอกชื่อวัตถุประสงค์");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createHallUsagePurpose({
        name: name.trim(),
        description: description.trim(),
        pricing_model: model,
        default_price: defaultPrice,
      });
      setPurposes((prev) => [...prev, created]);
      resetForm();
      onChanged();
    } catch (err) {
      console.error("Failed to create purpose:", err);
      setError(err instanceof Error ? err.message : "เพิ่มวัตถุประสงค์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p: HallUsagePurpose) => {
    setTogglingId(p.id);
    setError(null);
    try {
      const updated = await updateHallUsagePurpose(p.id, {
        is_active: !p.is_active,
      });
      setPurposes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      onChanged();
    } catch (err) {
      console.error("Failed to toggle purpose:", err);
      setError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* รายการวัตถุประสงค์ที่มีอยู่ */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            วัตถุประสงค์ทั้งหมด
          </p>
          {showLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : purposes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              ยังไม่มีวัตถุประสงค์
            </p>
          ) : (
            purposes.map((p) => (
              <div
                key={p.id}
                className="rounded-[9px] border border-slate-150 bg-slate-50/50 p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {p.name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {modelMeta(p.pricing_model).label}
                    {p.pricing_model === "per_type_per_day" &&
                      ` · ตั้งต้น ${p.default_price} บาท`}
                  </p>
                </div>
                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                  <span
                    className={`text-[11px] font-bold ${
                      p.is_active ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {p.is_active ? "เปิดใช้" : "ปิด"}
                  </span>
                  <Switch
                    checked={p.is_active}
                    disabled={togglingId === p.id}
                    onCheckedChange={() => handleToggle(p)}
                  />
                </label>
              </div>
            ))
          )}
        </div>

        {/* ฟอร์มเพิ่มวัตถุประสงค์ใหม่ */}
        <div className="rounded-[9px] border border-dashed border-slate-200 p-4 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            เพิ่มวัตถุประสงค์ใหม่
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              ชื่อวัตถุประสงค์
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น การจัดกิจกรรมส่งเสริมการขาย"
              className="h-11 rounded-[7px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              รายละเอียด (ไม่บังคับ)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายสั้นๆ"
              className="h-11 rounded-[7px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              วิธีคิดราคา
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setModel(m.value)}
                  className={`h-11 rounded-[7px] border text-xs font-bold transition-colors cursor-pointer ${
                    model === m.value
                      ? "border-[#f26522] bg-[#f26522]/10 text-[#f26522]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {model === "per_sqm"
                ? "ราคาต่อ ตร.ม./วัน ตั้งแยกรายอาคารในแท็บ “ราคาตามอาคาร”"
                : "คิดต่อจำนวนประเภทสินค้า/วัน — ใส่ราคาตั้งต้นด้านล่าง (ปรับรายอาคารได้ภายหลัง)"}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              ราคาตั้งต้น ({modelMeta(model).unit})
            </label>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={String(defaultPrice)}
              onChange={(e) =>
                setDefaultPrice(
                  e.target.value === ""
                    ? 0
                    : Math.max(0, Number(e.target.value) || 0)
                )
              }
              className="h-11 rounded-[7px] font-semibold text-slate-800"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[7px] px-4 py-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="w-full h-11 rounded-[7px] bg-primary hover:bg-brand-primary-600 text-white font-bold gap-2 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} strokeWidth={2.5} />
            )}
            {saving ? "กำลังเพิ่ม..." : "เพิ่มวัตถุประสงค์"}
          </Button>
        </div>
      </div>
    </div>
  );
}
