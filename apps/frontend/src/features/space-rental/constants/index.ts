export const AREA_CATEGORIES = [
  { value: "โรงอาหาร", label: "โรงอาหาร" },
  { value: "หอพักนักศึกษา", label: "หอพักนักศึกษา" },
  { value: "อาคารเรียนรวม", label: "อาคารเรียนรวม" },
  { value: "อาคารเครื่องมือ", label: "อาคารเครื่องมือ" },
  { value: "อาคารรัฐสีมาคุณากร", label: "อาคารรัฐสีมาคุณากร" },
  { value: "อาคารบริการหอพัก", label: "อาคารบริการหอพัก" },
  { value: "อาคารบรรณสาร", label: "อาคารบรรณสาร" },
  { value: "อาคารกีฬา", label: "อาคารกีฬา" },
  { value: "กลุ่มอาคารกิจการนักศึกษา", label: "กลุ่มอาคารกิจการนักศึกษา" },
  { value: "อาคารบริหาร", label: "อาคารบริหาร" },
  { value: "อาคารรักษาความปลอดภัย", label: "อาคารรักษาความปลอดภัย" },
  { value: "สุรสัมนาคาร", label: "สุรสัมนาคาร" },
  { value: "สุรพัฒน์ 2", label: "สุรพัฒน์ 2" },
  { value: "สุรพัฒน์ 3", label: "สุรพัฒน์ 3" },
  { value: "บ้านพักบุคลากร", label: "บ้านพักบุคลากร" },
  { value: "อาคารสำนักฟาร์ม", label: "อาคารสำนักฟาร์ม" },
  { value: "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี", label: "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี" },
  { value: "อ่างเก็บน้ำสระสามแสน", label: "อ่างเก็บน้ำสระสามแสน" },
  { value: "อื่นๆ", label: "อื่นๆ" },
] as const;

export const AREA_TO_BUILDINGS: Record<string, string[]> = {
  "โรงอาหาร": [
    "โรงอาหารพราวแสดทอง",
    "โรงอาหารกาสะลองคำ",
    "โรงอาหารคอนตะวัน",
    "โรงอาหารครัวท่านท้าว",
    "โรงอาหารเด่นทองกวาว",
    "โรงอาหารเรียนรวม2",
    "ศูนย์อาหารสุรนิเวศ"
  ],
  "หอพักนักศึกษา": [
    "หอพักสุรนิเวศ 1",
    "หอพักสุรนิเวศ 2",
    "หอพักสุรนิเวศ 3",
    "หอพักสุรนิเวศ 4",
    "ศูนย์บริการหอพัก"
  ],
  "อาคารเรียนรวม": [
    "อาคารเรียนรวม 1",
    "อาคารเรียนรวม 2"
  ],
  "อาคารเครื่องมือ": [
    "อาคารเครื่องมือ 1",
    "อาคารเครื่องมือ 2",
    "อาคารเครื่องมือ 3"
  ],
  "อื่นๆ": [
    "อาคารกิจการนักศึกษา",
    "ลานกิจกรรม",
    "ศูนย์บริการนักศึกษา",
    "โถงชั้น 1",
    "พื้นที่บริการกลาง",
    "จุดรับรอง",
    "ศูนย์รักษาความปลอดภัย",
    "จุดบริการหน้าอาคาร",
    "ห้องประชุม",
    "โถงรับรอง",
    "พื้นที่จัดเลี้ยง",
    "พื้นที่สำนักงาน",
    "พื้นที่บริการ",
    "โถงกลาง",
    "โซนบ้านพัก",
    "พื้นที่ชุมชน",
    "อาคารสำนักงาน",
    "พื้นที่จำหน่ายสินค้า",
    "จุดบริการ",
    "โถงผู้ป่วยนอก",
    "ศูนย์อาหาร",
    "พื้นที่บริการญาติ",
    "พื้นที่ริมอ่าง",
    "จุดพักผ่อน",
    "พื้นที่ชั่วคราว",
    "จุดบริการพิเศษ",
    "พื้นที่ตามกิจกรรม"
  ]
};

export const BUILDINGS = [
  { value: "โรงอาหารพราวแสดทอง", label: "โรงอาหารพราวแสดทอง" },
  { value: "โรงอาหารกาสะลองคำ", label: "โรงอาหารกาสะลองคำ" },
  { value: "โรงอาหารคอนตะวัน", label: "โรงอาหารคอนตะวัน" },
  { value: "โรงอาหารครัวท่านท้าว", label: "โรงอาหารครัวท่านท้าว" },
  { value: "โรงอาหารเด่นทองกวาว", label: "โรงอาหารเด่นทองกวาว" },
  { value: "โรงอาหารเรียนรวม2", label: "โรงอาหารเรียนรวม2" },
  { value: "ศูนย์อาหารสุรนิเวศ", label: "ศูนย์อาหารสุรนิเวศ" },
  { value: "หอพักสุรนิเวศ 1", label: "หอพักสุรนิเวศ 1" },
  { value: "หอพักสุรนิเวศ 2", label: "หอพักสุรนิเวศ 2" },
  { value: "หอพักสุรนิเวศ 3", label: "หอพักสุรนิเวศ 3" },
  { value: "หอพักสุรนิเวศ 4", label: "หอพักสุรนิเวศ 4" },
  { value: "อาคารเรียนรวม 1", label: "อาคารเรียนรวม 1" },
  { value: "อาคารเรียนรวม 2", label: "อาคารเรียนรวม 2" },
  { value: "อาคารเครื่องมือ 1", label: "อาคารเครื่องมือ 1" },
  { value: "อาคารเครื่องมือ 2", label: "อาคารเครื่องมือ 2" },
  { value: "อาคารเครื่องมือ 3", label: "อาคารเครื่องมือ 3" },
  { value: "โถงบริการ", label: "โถงบริการ" },
  { value: "ชั้น 1", label: "ชั้น 1" },
  { value: "ศูนย์บริการหอพัก", label: "ศูนย์บริการหอพัก" },
  { value: "พื้นที่รับรอง", label: "พื้นที่รับรอง" },
  { value: "จุดบริการกลาง", label: "จุดบริการกลาง" },
  { value: "โซนอ่านหนังสือ", label: "โซนอ่านหนังสือ" },
  { value: "โถงทางเข้า", label: "โถงทางเข้า" },
  { value: "สนามกีฬาในร่ม", label: "สนามกีฬาในร่ม" },
  { value: "ศูนย์ฟิตเนส", label: "ศูนย์ฟิตเนส" },
  { value: "พื้นที่กิจกรรม", label: "พื้นที่กิจกรรม" },
  { value: "อาคารกิจการนักศึกษา", label: "อาคารกิจการนักศึกษา" },
  { value: "ลานกิจกรรม", label: "ลานกิจกรรม" },
  { value: "ศูนย์บริการนักศึกษา", label: "ศูนย์บริการนักศึกษา" },
  { value: "โถงชั้น 1", label: "โถงชั้น 1" },
  { value: "พื้นที่บริการกลาง", label: "พื้นที่บริการกลาง" },
  { value: "จุดรับรอง", label: "จุดรับรอง" },
  { value: "ศูนย์รักษาความปลอดภัย", label: "ศูนย์รักษาความปลอดภัย" },
  { value: "จุดบริการหน้าอาคาร", label: "จุดบริการหน้าอาคาร" },
  { value: "ห้องประชุม", label: "ห้องประชุม" },
  { value: "โถงรับรอง", label: "โถงรับรอง" },
  { value: "พื้นที่จัดเลี้ยง", label: "พื้นที่จัดเลี้ยง" },
  { value: "พื้นที่สำนักงาน", label: "พื้นที่สำนักงาน" },
  { value: "พื้นที่บริการ", label: "พื้นที่บริการ" },
  { value: "โถงกลาง", label: "โถงกลาง" },
  { value: "โซนบ้านพัก", label: "โซนบ้านพัก" },
  { value: "พื้นที่ชุมชน", label: "พื้นที่ชุมชน" },
  { value: "อาคารสำนักงาน", label: "อาคารสำนักงาน" },
  { value: "พื้นที่จำหน่ายสินค้า", label: "พื้นที่จำหน่ายสินค้า" },
  { value: "จุดบริการ", label: "จุดบริการ" },
  { value: "โถงผู้ป่วยนอก", label: "โถงผู้ป่วยนอก" },
  { value: "ศูนย์อาหาร", label: "ศูนย์อาหาร" },
  { value: "พื้นที่บริการญาติ", label: "พื้นที่บริการญาติ" },
  { value: "พื้นที่ริมอ่าง", label: "พื้นที่ริมอ่าง" },
  { value: "จุดพักผ่อน", label: "จุดพักผ่อน" },
  { value: "พื้นที่ชั่วคราว", label: "พื้นที่ชั่วคราว" },
  { value: "จุดบริการพิเศษ", label: "จุดบริการพิเศษ" },
  { value: "พื้นที่ตามกิจกรรม", label: "พื้นที่ตามกิจกรรม" },
] as const;

export type CommercialCategoryType = 
  | 'fresh_coffee_beverage_snacks'
  | 'convenience_store_minimart'
  | 'vending_machine'
  | 'washing_machine_service'
  | 'atm_service'
  | 'telecom_network'
  | 'it_equipment_sales'
  | 'billboard_media'
  | 'printing_document_service'
  | 'space_usage'
  | 'canteen'
  | 'other';

export interface CommercialCategory {
  readonly value: CommercialCategoryType;
  readonly title: string;
  readonly desc: string;
  readonly count: number;
  readonly iconName: string;
}

export const COMMERCIAL_CATEGORIES: readonly CommercialCategory[] = [
  {
    value: 'fresh_coffee_beverage_snacks',
    title: 'กาแฟสด เครื่องดื่ม อาหารว่าง',
    desc: 'ร้านกาแฟสด เครื่องดื่ม เบเกอรี่ และอาหารว่าง',
    count: 24,
    iconName: 'Coffee',
  },
  {
    value: 'convenience_store_minimart',
    title: 'ร้านสะดวกซื้อ/มินิมาร์ท',
    desc: 'ร้านสะดวกซื้อ มินิมาร์ท และร้านจำหน่ายสินค้าอุปโภคบริโภค',
    count: 12,
    iconName: 'ShoppingBag',
  },
  {
    value: 'vending_machine',
    title: 'ตู้จำหน่ายสินค้าอัตโนมัติ',
    desc: 'ตู้กดเครื่องดื่ม ตู้จำหน่ายขนม และสินค้าอัตโนมัติ',
    count: 35,
    iconName: 'Box',
  },
  {
    value: 'washing_machine_service',
    title: 'ให้บริการเครื่องซักผ้าอัตโนมัติ',
    desc: 'จุดบริการเครื่องซักผ้าและอบผ้าหยอดเหรียญ/อัตโนมัติ',
    count: 18,
    iconName: 'Shirt',
  },
  {
    value: 'atm_service',
    title: 'ให้บริการติดตั้งตู้ ATM',
    desc: 'จุดติดตั้งตู้ถอนเงินอัตโนมัติ (ATM) ของธนาคารต่างๆ',
    count: 15,
    iconName: 'CreditCard',
  },
  {
    value: 'telecom_network',
    title: 'เครือข่ายโทรคมนาคม (เสารับ-ส่งสัญญาณ Small Cell Access Point)',
    desc: 'จุดติดตั้งเสาสัญญาณ Small Cell, Access Point และอุปกรณ์สื่อสาร',
    count: 82,
    iconName: 'Radio',
  },
  {
    value: 'it_equipment_sales',
    title: 'จำหน่ายอุปกรณ์ IT',
    desc: 'ร้านจำหน่ายอุปกรณ์คอมพิวเตอร์ สมาร์ทโฟน และอุปกรณ์ไอที',
    count: 8,
    iconName: 'Monitor',
  },
  {
    value: 'billboard_media',
    title: 'ป้ายและสื่อประชาสัมพันธ์',
    desc: 'พื้นที่ป้ายโฆษณา สื่อดิจิทัล และป้ายประชาสัมพันธ์',
    count: 25,
    iconName: 'Tv',
  },
  {
    value: 'printing_document_service',
    title: 'เครื่องพิมพ์เอกสาร',
    desc: 'จุดบริการปริ้นท์เอกสาร ถ่ายเอกสาร และเครื่องพิมพ์อัตโนมัติ',
    count: 14,
    iconName: 'Printer',
  },
  {
    value: 'space_usage',
    title: 'ใช้พื้นที่',
    desc: 'พื้นที่จัดกิจกรรม บูธชั่วคราว และพื้นที่ใช้สอยอเนกประสงค์',
    count: 30,
    iconName: 'MapPin',
  },
  {
    value: 'canteen',
    title: 'โรงอาหาร',
    desc: 'พื้นที่ศูนย์อาหาร และแผงจำหน่ายอาหารภายในโรงอาหาร',
    count: 45,
    iconName: 'Utensils',
  },
  {
    value: 'other',
    title: 'อื่นๆ',
    desc: 'ผู้ประกอบการและประเภทพื้นที่อื่นๆ',
    count: 10,
    iconName: 'Building2',
  },
] as const;

export const DEFAULT_RENTAL_SPACE_CONFIG = {
  address: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
  coordinates: [14.8804616, 102.0161729] as [number, number],
  image: "https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg",
  defaultPrice: 5000,
  defaultSize: "15 ตร.ม.",
};

// แปลงชื่อข้อความประเภทธุรกิจ/สัญญา ให้กลายเป็น CommercialCategoryType ประจำระบบ
export function mapBusinessCategoryName(categoryName?: string): CommercialCategoryType {
  if (!categoryName) return "canteen";
  const cat = categoryName.toLowerCase();
  if (cat.includes("กาแฟ") || cat.includes("เครื่องดื่ม") || cat.includes("อาหารว่าง")) {
    return "fresh_coffee_beverage_snacks";
  }
  if (cat.includes("สะดวกซื้อ") || cat.includes("มินิมาร์ท")) {
    return "convenience_store_minimart";
  }
  if (cat.includes("ตู้จำหน่าย") || cat.includes("ตู้กด")) {
    return "vending_machine";
  }
  if (cat.includes("ซักผ้า")) {
    return "washing_machine_service";
  }
  if (cat.includes("atm")) {
    return "atm_service";
  }
  if (cat.includes("เสา") || cat.includes("โทรคมนาคม") || cat.includes("access point") || cat.includes("small cell")) {
    return "telecom_network";
  }
  if (cat.includes("it") || cat.includes("ไอที") || cat.includes("คอมพิวเตอร์")) {
    return "it_equipment_sales";
  }
  if (cat.includes("ป้าย") || cat.includes("สื่อ")) {
    return "billboard_media";
  }
  if (cat.includes("พิมพ์") || cat.includes("เอกสาร") || cat.includes("ปริ้นท์")) {
    return "printing_document_service";
  }
  if (cat.includes("ใช้พื้นที่")) {
    return "space_usage";
  }
  if (cat.includes("โรงอาหาร") || cat.includes("ก๋วยเตี๋ยว") || cat.includes("ส้มตำ") || cat.includes("สุกี้")) {
    return "canteen";
  }
  return "other";
}

export * from "./area-ui-config";
