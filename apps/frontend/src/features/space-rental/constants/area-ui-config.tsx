export { getCategoryIcon } from "@/utils/commercial-category-icons";

export interface StatusStyle {
  label: string;
  color: string;
  dot: string;
}

export const AREA_STATUS_CONFIG: Record<string, StatusStyle> = {
  occupied: {
    label: "มีผู้เช่า",
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  available: {
    label: "ว่าง",
    color: "bg-amber-50/90 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  maintenance: {
    label: "ปิดซ่อมบำรุง",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};
