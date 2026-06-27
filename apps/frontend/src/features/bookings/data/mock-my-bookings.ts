export type BookingStatus = "รออนุมัติ" | "อนุมัติแล้ว" | "ที่ผ่านมา" | "ยกเลิก" | "ปฏิเสธ";

export interface MyBooking {
  id: string;
  bookingId: number;
  room: {
    name: string;
    building: string;
    image: string;
    icon?: string;
  };
  date: string;
  dateEnd?: string;
  days?: number;
  startTime: string;
  endTime: string;
  price: number;
  status: BookingStatus;
  needsPayment?: boolean;
  waitDays?: number;
  upcomingLabel?: string;
}

export const mockMyBookings: MyBooking[] = [
  {
    bookingId: 0,
  id: "BK-1042",
    room: {
      name: "Room A",
      building: "อาคารหลัก",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    },
    date: "15 เม.ย. 2569",
    startTime: "10:00",
    endTime: "12:00",
    price: 500,
    status: "รออนุมัติ",
    waitDays: 2,
    upcomingLabel: "พรุ่งนี้",
  },
  {
    bookingId: 0,
  id: "BK-1041",
    room: {
      name: "Creativity Hub",
      building: "โซนสร้างสรรค์",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    },
    date: "16 เม.ย. 2569",
    dateEnd: "18 เม.ย. 2569",
    days: 3,
    startTime: "09:00",
    endTime: "17:00",
    price: 4500,
    status: "รออนุมัติ",
    upcomingLabel: "อีก 3 วัน",
  },
  {
    bookingId: 0,
  id: "BK-1038",
    room: {
      name: "The Boardroom",
      building: "อาคารบี",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
    },
    date: "22 เม.ย. 2569",
    startTime: "09:00",
    endTime: "11:00",
    price: 1200,
    status: "อนุมัติแล้ว",
    needsPayment: true,
    upcomingLabel: "สัปดาห์หน้า",
  },
  {
    bookingId: 0,
  id: "BK-1035",
    room: {
      name: "Zen Space",
      building: "อิ่มดวงฟ้า",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    },
    date: "13 เม.ย. 2569",
    startTime: "14:00",
    endTime: "16:00",
    price: 800,
    status: "อนุมัติแล้ว",
  },
  {
    bookingId: 0,
  id: "BK-1030",
    room: {
      name: "Conference Room 4",
      building: "อาคารหลัก",
      image: "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=600&q=80",
    },
    date: "09 เม.ย. 2569",
    startTime: "11:00",
    endTime: "13:00",
    price: 1000,
    status: "ปฏิเสธ",
  },
  {
    bookingId: 0,
  id: "BK-1028",
    room: {
      name: "ห้องประชุม Smart D",
      building: "อาคาร D",
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&q=80",
    },
    date: "05 เม.ย. 2569",
    startTime: "13:00",
    endTime: "15:00",
    price: 700,
    status: "ที่ผ่านมา",
  },
  {
    bookingId: 0,
  id: "BK-1025",
    room: {
      name: "ห้อง Co-Working Space",
      building: "อาคาร G",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    },
    date: "01 เม.ย. 2569",
    startTime: "09:00",
    endTime: "17:00",
    price: 2400,
    status: "ที่ผ่านมา",
  },
  {
    bookingId: 0,
  id: "BK-1020",
    room: {
      name: "ห้องประชุม Executive A",
      building: "อาคาร A",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80",
    },
    date: "28 มี.ค. 2569",
    startTime: "10:00",
    endTime: "12:00",
    price: 1000,
    status: "ที่ผ่านมา",
  },
  {
    bookingId: 0,
  id: "BK-1015",
    room: {
      name: "Training Room 1",
      building: "อาคาร E",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    },
    date: "20 มี.ค. 2569",
    startTime: "08:00",
    endTime: "17:00",
    price: 7200,
    status: "ที่ผ่านมา",
  },
  {
    bookingId: 0,
  id: "BK-1010",
    room: {
      name: "ห้องประชุม Innovation Lab",
      building: "อาคาร B",
      image: "https://images.unsplash.com/photo-1505409628601-edc9af17fda6?w=600&q=80",
    },
    date: "15 มี.ค. 2569",
    startTime: "13:00",
    endTime: "16:00",
    price: 1950,
    status: "ยกเลิก",
  },
  {
    bookingId: 0,
  id: "BK-1005",
    room: {
      name: "ห้องประชุม Classic G",
      building: "อาคาร G",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    },
    date: "10 มี.ค. 2569",
    startTime: "09:00",
    endTime: "11:00",
    price: 800,
    status: "ที่ผ่านมา",
  },
  {
    bookingId: 0,
  id: "BK-1001",
    room: {
      name: "ห้องประชุม VIP Suite",
      building: "อาคาร A",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    },
    date: "01 มี.ค. 2569",
    startTime: "14:00",
    endTime: "17:00",
    price: 3600,
    status: "ที่ผ่านมา",
  },
];
