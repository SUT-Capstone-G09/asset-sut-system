"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Coins,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getBuildingsWithPricing,
  getHallUsagePurposes,
  updateBuildingHallPricings,
} from "../../services/hallPricingService";
import {
  BuildingWithPricing,
  HallPricingModel,
  HallUsagePurpose,
} from "../../types/pricing";
import HallPurposesTab from "./HallPurposesTab";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void; // แจ้ง parent ให้ refresh ถ้าต้องการ
}

interface RowDraft {
  purposeId: number;
  name: string;
  model: HallPricingModel;
  price: number;
  isActive: boolean;
}

// แถวสำหรับแสดงผล — price เป็น null เมื่อยังไม่ได้เลือกอาคาร (แสดงช่องราคาว่างไว้ แต่แถวไม่หาย)
interface RowView {
  purposeId: number;
  name: string;
  model: HallPricingModel;
  price: number | null;
  isActive: boolean;
}

const unitLabel = (m: HallPricingModel) =>
  m === "per_sqm" ? "บาท / ตร.ม. / วัน" : "บาท / ประเภทสินค้า / วัน";

function buildDrafts(
  buildings: BuildingWithPricing[],
  purposes: HallUsagePurpose[],
): Record<number, RowDraft[]> {
  const map: Record<number, RowDraft[]> = {};
  for (const b of buildings) {
    const existing = new Map(
      (b.hall_pricings ?? []).map((p) => [p.hall_usage_purpose_id, p]),
    );
    map[b.id] = purposes.map((p) => {
      const cur = existing.get(p.id);
      return {
        purposeId: p.id,
        name: p.name,
        model: p.pricing_model,
        price: cur ? cur.price : p.default_price,
        isActive: cur ? cur.is_active : true,
      };
    });
  }
  return map;
}

export default function HallPricingDrawer({ open, onClose, onSaved }: Props) {
  const [purposes, setPurposes] = useState<HallUsagePurpose[]>([]);
  const [buildings, setBuildings] = useState<BuildingWithPricing[]>([]);
  const [drafts, setDrafts] = useState<Record<number, RowDraft[]>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  // portal ตัว dropdown ของ combobox เข้าไปใน Sheet เอง (Sheet เป็น modal z-100 + ล็อก pointer)
  // ถ้าปล่อยให้ portal ไป body ตาม default dropdown จะโดนบังอยู่หลัง Sheet และคลิกไม่ได้
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  // โหลดอาคาร+ราคา+วัตถุประสงค์ ; setState ทั้งหมดอยู่หลัง await (ไม่ sync ใน effect) กัน cascading render
  // เรียกได้ทั้งตอนเปิด และตอนแท็บวัตถุประสงค์เพิ่ม/แก้รายการ (onChanged) เพื่อรีเฟรชแถวราคา
  const reload = useCallback(async () => {
    try {
      const [blds, prps] = await Promise.all([
        getBuildingsWithPricing(),
        getHallUsagePurposes(),
      ]);
      setBuildings(blds);
      setPurposes(prps);
      setDrafts(buildDrafts(blds, prps));
      setError(null);
      setInitialized(true);
    } catch (err) {
      console.error("Failed to load hall pricing:", err);
      setError("โหลดข้อมูลราคาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      await reload();
    })();
  }, [open, reload]);

  // loading = เปิดอยู่แต่ยังโหลดครั้งแรกไม่เสร็จ (เปิดซ้ำใช้ข้อมูลเดิม + refetch เงียบ)
  const loading = open && !initialized && !error;

  // แถววัตถุประสงค์แสดงเสมอ (จาก master) ; ราคา/สถานะดึงจากอาคารที่เลือก — ยังไม่เลือก = ราคาว่าง
  const rows: RowView[] = useMemo(() => {
    const draft = selectedId != null ? drafts[selectedId] : undefined;
    return purposes.map((p) => {
      const d = draft?.find((r) => r.purposeId === p.id);
      return {
        purposeId: p.id,
        name: p.name,
        model: p.pricing_model,
        price: d ? d.price : null,
        isActive: d ? d.isActive : true,
      };
    });
  }, [purposes, drafts, selectedId]);

  const updateRow = (purposeId: number, patch: Partial<RowDraft>) => {
    if (selectedId == null) return;
    setSavedName(null);
    setDrafts((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).map((r) =>
        r.purposeId === purposeId ? { ...r, ...patch } : r,
      ),
    }));
  };

  const selectedBuildingName = useMemo(
    () => buildings.find((b) => b.id === selectedId)?.name ?? "",
    [buildings, selectedId],
  );

  // items เป็น array ของชื่ออาคาร (ชื่อ unique) ให้ base-ui Combobox ค้นหา/แสดงได้ตรงๆ
  const buildingNames = useMemo(
    () => buildings.map((b) => b.name),
    [buildings],
  );

  const selectBuilding = (id: number | null) => {
    setSelectedId(id);
    setSavedName(null);
  };

  // ปิด drawer แล้วล้างการเลือกอาคาร เพื่อให้เปิดครั้งถัดไปเริ่มที่ "ยังไม่เลือกอาคาร"
  const handleClose = () => {
    setSelectedId(null);
    setSavedName(null);
    onClose();
  };

  const handleSave = async () => {
    if (selectedId == null) return;
    setSaving(true);
    setError(null);
    setSavedName(null);
    try {
      const updated = await updateBuildingHallPricings(
        selectedId,
        rows.map((r) => ({
          hall_usage_purpose_id: r.purposeId,
          price: r.price ?? 0,
          is_active: r.isActive,
        })),
      );
      // sync ราคาที่ backend คืนกลับมาเข้า state
      setBuildings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
      setDrafts((prev) => ({
        ...prev,
        [updated.id]: buildDrafts([updated], purposes)[updated.id],
      }));
      setSavedName(selectedBuildingName);
      onSaved?.();
      
    } catch (err) {
      console.error("Failed to save hall pricing:", err);
      setError(
        err instanceof Error ? err.message : "บันทึกราคาไม่สำเร็จ กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? undefined : handleClose())}>
      <SheetContent
        ref={setPortalContainer}
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-[560px] p-0 border-none bg-white flex flex-col h-full shadow-2xl"
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white text-left">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[7px] bg-[#f26522]/10 flex items-center justify-center">
              <Coins size={20} className="text-[#f26522]" strokeWidth={2.5} />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                ตั้งราคาการขอใช้พื้นที่โถง
              </SheetTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                ราคาใช้ร่วมทุกโถงในอาคารเดียวกัน
              </p>
            </div>
            <SheetDescription className="sr-only">
              ตั้งราคาการขอใช้พื้นที่โถงแยกตามอาคารและวัตถุประสงค์
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group cursor-pointer"
          >
            <X
              size={18}
              className="transition-transform group-hover:rotate-90"
            />
          </button>
        </SheetHeader>

        <Tabs
          defaultValue="pricing"
          className="flex-1 flex flex-col min-h-0 gap-0"
        >
          <TabsList className="mx-6 mt-4 shrink-0">
            <TabsTrigger value="pricing">ราคาตามอาคาร</TabsTrigger>
            <TabsTrigger value="purposes">วัตถุประสงค์</TabsTrigger>
          </TabsList>

          <TabsContent
            value="pricing"
            className="flex-1 flex flex-col min-h-0 mt-0"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : buildings.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-20">
                  ยังไม่มีอาคารในระบบ
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      อาคาร
                    </label>
                    <Combobox
                      items={buildingNames}
                      value={selectedId != null ? selectedBuildingName : null}
                      onValueChange={(name) => {
                        const b = buildings.find((x) => x.name === name);
                        selectBuilding(b ? b.id : null);
                      }}
                    >
                      <ComboboxInput
                        placeholder="เลือกอาคาร / พิมพ์ชื่อ..."
                        className="h-11 w-full rounded-[7px]"
                      />
                      <ComboboxContent container={portalContainer}>
                        <ComboboxEmpty>ไม่พบอาคาร</ComboboxEmpty>
                        <ComboboxList>
                          {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="space-y-3">
                    {rows.map((r) => (
                      <div
                        key={r.purposeId}
                        className="rounded-[9px] border border-slate-150 bg-slate-50/50 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 leading-snug">
                              {r.name}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {unitLabel(r.model)}
                            </p>
                          </div>
                          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                            <span
                              className={`text-[11px] font-bold ${
                                r.isActive
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {r.isActive ? "เปิดใช้" : "ปิด"}
                            </span>
                            <Switch
                              checked={r.isActive}
                              disabled={selectedId == null}
                              onCheckedChange={(v) =>
                                updateRow(r.purposeId, { isActive: v })
                              }
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            disabled={selectedId == null || !r.isActive}
                            value={r.price == null ? "" : String(r.price)}
                            placeholder={
                              selectedId == null ? "เลือกอาคารก่อน" : "0"
                            }
                            onChange={(e) =>
                              updateRow(r.purposeId, {
                                price:
                                  e.target.value === ""
                                    ? 0
                                    : Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="h-11 rounded-[7px] font-semibold text-slate-800 disabled:opacity-50"
                          />
                          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                            {unitLabel(r.model)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-5 border-t border-slate-100 flex flex-col gap-3 bg-white/90 backdrop-blur-md shrink-0">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[7px] px-4 py-3">
                  <AlertCircle
                    size={16}
                    className="text-red-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}
              {savedName && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-[7px] px-4 py-3">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-bold text-emerald-600">
                    บันทึกราคาของ {savedName} เรียบร้อยแล้ว
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ปิด
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || loading || selectedId == null}
                  className="flex-1 h-12 rounded-[7px] bg-primary hover:bg-brand-primary-600 text-white font-bold shadow-lg shadow-[#f26522]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "กำลังบันทึก..." : "บันทึกราคา"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="purposes"
            className="flex-1 flex flex-col min-h-0 mt-0"
          >
            <HallPurposesTab open={open} onChanged={reload} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
