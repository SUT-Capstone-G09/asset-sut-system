export interface Equipment {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const EQUIPMENT_LIST: Equipment[] = [
  { id: "camera_4k", name: "กล้องวิดีโอ 4K", description: "รองรับการประชุมทางไกล", icon: "video" },
  { id: "mic_pro", name: "ไมโครโฟนโปร", description: "ชุดไมค์คอนเดนเซอร์", icon: "mic" },
  { id: "smart_whiteboard", name: "ไวท์บอร์ดอัจฉริยะ", description: "เขียนและแชร์ไฟล์ได้ทันที", icon: "pen-line" },
  { id: "catering", name: "บริการอาหารและเครื่องดื่ม", description: "กาแฟ ขนมเบรค และน้ำดื่ม", icon: "utensils" },
];
