import {
  Utensils,
  Home,
  GraduationCap,
  Wrench,
  Landmark,
  Handshake,
  LibraryBig,
  Dumbbell,
  Store,
  BriefcaseBusiness,
  ShieldCheck,
  Building2,
  Warehouse,
  Trees,
  BookOpen,
  HeartPulse,
  Waves,
  BadgeHelp,
  type LucideIcon
} from "lucide-react";

export const COMMERCIAL_CATEGORY_ICONS: Record<string, LucideIcon> = {
  "โรงอาหาร": Utensils,
  "หอพักนักศึกษา": Home,
  "อาคารเรียนรวม": GraduationCap,
  "อาคารเครื่องมือ": Wrench,
  "อาคารัฐสีมาคุณากร": Landmark,
  "อาคารบริการหอพัก": Handshake,
  "อาคารบรรณสาร": LibraryBig,
  "อาคารกีฬา": Dumbbell,
  "กลุ่มอาคารกิจการนักศึกษา": Store,
  "อาคารบริหาร": BriefcaseBusiness,
  "อาคารรักษาความปลอดภัย": ShieldCheck,
  "สุรสัมนาคาร": Building2,
  "สุรพัฒน์ 2": Warehouse,
  "สุรพัฒน์ 3": Warehouse,
  "บ้านพักบุคลากร": Trees,
  "อาคารสำนักฟาร์ม": BookOpen,
  "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี": HeartPulse,
  "อ่างเก็บน้ำสระสามแสน": Waves,
  "อื่นๆ": BadgeHelp,
};

export function getCategoryIcon(categoryName: string): LucideIcon {
  return COMMERCIAL_CATEGORY_ICONS[categoryName] ?? Building2;
}
