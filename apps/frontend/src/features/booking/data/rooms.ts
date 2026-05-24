import { Room } from "../types/room";

export const mockRooms: Room[] = [
  {
    id: "RM-001",
    roomName: "ห้องบรรยาย B1101",
    roomNumber: "B1101",
    building: "อาคารเรียนรวม 1",
    category: "ห้องบรรยาย",
    capacity: 80,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    status: "available",
    equipment: ["เครื่องฉายโปรเจคเตอร์", "ไมโครโฟนไร้สาย", "กระดานไวท์บอร์ด", "เครื่องปรับอากาศ"],
    notes: "ห้องบรรยายขนาดใหญ่ เหมาะสำหรับการเรียนการสอนเชิงวิชาการและการนำเสนอผลงาน",
    rates: {
      hourlyInternal: 100,
      hourlyExternal: 300,
      dailyInternal: 800,
      dailyExternal: 2000
    },
    documents: ["floor_plan_b1101.pdf"]
  },
  {
    id: "RM-002",
    roomName: "ห้องปฏิบัติการคอมพิวเตอร์ B1203",
    roomNumber: "B1203",
    building: "อาคารเรียนรวม 1",
    category: "ห้องปฏิบัติการ",
    capacity: 60,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
    status: "available",
    equipment: ["เครื่องฉายโปรเจคเตอร์", "ระบบคอมพิวเตอร์ลูกข่าย", "ระบบควบคุมจอภาพนักเรียน", "เครื่องปรับอากาศ", "กระดานไวท์บอร์ด"],
    notes: "เครื่องคอมพิวเตอร์สเปกสูง 60 เครื่องพร้อมใช้งานสำหรับการเรียนการสอนเขียนโปรแกรมและงานคำนวณประสิทธิภาพสูง",
    rates: {
      hourlyInternal: 200,
      hourlyExternal: 500,
      dailyInternal: 1500,
      dailyExternal: 3500
    },
    documents: ["spec_pc_b1203.pdf", "room_rules.pdf"]
  },
  {
    id: "RM-003",
    roomName: "ห้องสัมมนา B2102",
    roomNumber: "B2102",
    building: "อาคารเรียนรวม 2",
    category: "ห้องสัมมนา",
    capacity: 40,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    status: "available",
    equipment: ["เครื่องฉายโปรเจคเตอร์", "ไมโครโฟนไร้สาย", "ระบบไฮบริด (Zoom/Teams)", "เครื่องปรับอากาศ", "สมาร์ททีวี"],
    notes: "ห้องสัมมนารองรับการจัดสัมมนาแบบไฮบริด มีกล้องติดตามตัววิทยากรและระบบไมโครโฟนรอบทิศทาง",
    rates: {
      hourlyInternal: 150,
      hourlyExternal: 400,
      dailyInternal: 1000,
      dailyExternal: 2800
    },
    documents: ["hybrid_manual_b2102.pdf"]
  },
  {
    id: "RM-004",
    roomName: "ห้องบรรยาย B1205",
    roomNumber: "B1205",
    building: "อาคารเรียนรวม 1",
    category: "ห้องบรรยาย",
    capacity: 50,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    status: "maintenance",
    equipment: ["เครื่องฉายโปรเจคเตอร์", "กระดานไวท์บอร์ด", "เครื่องปรับอากาศ"],
    notes: "ปิดปรับปรุงระบบปรับอากาศชั่วคราว คาดว่าจะเสร็จสิ้นในวันที่ 30 พฤษภาคม 2569",
    rates: {
      hourlyInternal: 100,
      hourlyExternal: 300,
      dailyInternal: 800,
      dailyExternal: 2000
    },
    documents: []
  },
  {
    id: "RM-005",
    roomName: "ห้องประชุมสารนิเทศ SUT-A",
    roomNumber: "SUT-A",
    building: "อาคารบริหาร",
    category: "ห้องประชุมขนาดใหญ่",
    capacity: 35,
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800",
    status: "available",
    equipment: ["ระบบเสียงชุดประชุม", "เครื่องฉายโปรเจคเตอร์", "สมาร์ททีวี", "กล้องคอนเฟอเรนซ์", "เครื่องปรับอากาศ"],
    notes: "ห้องประชุมสำหรับคณะกรรมการระดับมหาวิทยาลัย มีระบบโหวตอิเล็กทรอนิกส์และบริการเครื่องดื่ม",
    rates: {
      hourlyInternal: 300,
      hourlyExternal: 800,
      dailyInternal: 2500,
      dailyExternal: 6000
    },
    documents: ["sut_a_floorplan.pdf"]
  },
  {
    id: "RM-006",
    roomName: "ห้องประชุมวิชาการ F1201",
    roomNumber: "F1201",
    building: "อาคารเครื่องมือ F1",
    category: "ห้องประชุมขนาดกลาง",
    capacity: 15,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
    status: "available",
    equipment: ["สมาร์ททีวี", "กระดานไวท์บอร์ด", "กล้องคอนเฟอเรนซ์", "เครื่องปรับอากาศ"],
    notes: "ห้องประชุมขนาดกลางสำหรับการประชุมย่อยภายในสถาบันวิจัยวิศวกรรมศาสตร์",
    rates: {
      hourlyInternal: 150,
      hourlyExternal: 400,
      dailyInternal: 1000,
      dailyExternal: 3000
    },
    documents: []
  }
];
