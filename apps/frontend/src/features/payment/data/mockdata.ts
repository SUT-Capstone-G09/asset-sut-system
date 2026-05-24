// src/features/payment/data/mock-payment.ts

export interface PaymentData {
  roomName: string;
  location: string;
  bannerUrl: string;
  bookingDate: string;
  bookingTime: string;
  hourlyRate: number;
  hours: number;
  accountName: string;
  qrCodeUrl: string;
  description: string;
  PAY_REF: string;
}

export const mockPaymentData: PaymentData = {
  roomName: "B4101 (1500 คน)",
  location: "อาคารเรียนรวม 1 ชั้น 1",
  bannerUrl: "/room-b4101.jpg",
  bookingDate: "31 สิงหาคม 2569",
  bookingTime: "14:00 - 18:00",
  hourlyRate: 2250,
  hours: 4,
  accountName: "มหาวิทยาลัยเทคโนโลยีสุรนารี",
  qrCodeUrl: "/qr-code.png",
  description:
    "กรุณาชำระเงินผ่าน QR Code Payment ภายใน 7 วัน" +
    "\n" +
    "และอัปโหลดหลักฐานการชำระเงินเพื่อยืนยันการขอใช้พื้นที่ของคุณ",
  PAY_REF: "PAY-20250901-001",
};
