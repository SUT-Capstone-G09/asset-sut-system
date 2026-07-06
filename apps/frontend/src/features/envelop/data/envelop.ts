import { EnvelopDocument, EnvelopPayment } from "../types/envelop";

export const mockEnvelopDocuments: EnvelopDocument[] = [
  {
    id: "1",
    name: "ล็อค 1 พื้นที่จำหน่ายอาหารคาว",
    location: "โรงอาหารกาสะลอง",
    documentStatus: "on_sale",
    amount: 3000,
    date: "01/05/2568",
  },
  {
    id: "2",
    name: "ล็อค B4 พื้นที่อาหารคาว",
    location: "โรงอาหารเรียนรวม2",
    documentStatus: "on_sale",
    amount: 2800,
    date: "03/05/2568",
  },
  {
    id: "3",
    name: "พื้นที่ติดตั้งตู้กดน้ำดื่มอัตโนมัติ (จุดที่3)",
    location: "อาคารเรียนรวม 1",
    documentStatus: "on_sale",
    amount: 800,
    date: "07/05/2568",
  },
  {
    id: "4",
    name: "ชุมจำหน่ายเครื่องดื่มและเบเกอรี่",
    location: "หอพักหญิง 15",
    documentStatus: "archived",
    amount: 1500,
    date: "30/04/2568",
  },
];

export const mockEnvelopPayments: EnvelopPayment[] = [
  {
    id: "1",
    ref: "#49201",
    tenantName: "นายสมชาย รักดี",
    location: "ล็อค 1 พื้นที่จำหน่ายอาหารคาว",
    amount: 3500,
    date: "12/05/2568",
    status: "pending_payment",
  },
  {
    id: "2",
    ref: "#49198",
    tenantName: "นางสาววิภา พาณิช",
    location: "ล็อค B4 พื้นที่อาหารคาว",
    amount: 2800,
    date: "10/05/2568",
    status: "paid",
    paidAt: "เมื่อ 2 ชั่วโมงที่แล้ว",
  },
  {
    id: "3",
    ref: "#49195",
    tenantName: "นางสาวพิชญ์สินี ดีเมืองขวา",
    location: "ชุมจำหน่ายเครื่องดื่มและเบเกอรี่",
    amount: 1500,
    date: "09/05/2568",
    status: "pending_payment",
  },
  {
    id: "4",
    ref: "#49190",
    tenantName: "นายอานนท์ สุขใจ",
    location: "พื้นที่ติดตั้งตู้กดน้ำดื่มอัตโนมัติ (จุดที่3)",
    amount: 800,
    date: "07/05/2568",
    status: "cancelled",
    rejectionReason: "สลิปไม่ชัดเจน ไม่สามารถยืนยันยอดได้",
  },
  {
    id: "5",
    ref: "#49185",
    tenantName: "นางมาลี ประสงค์ดี",
    location: "ล็อค 1 พื้นที่จำหน่ายอาหารคาว",
    amount: 3500,
    date: "05/05/2568",
    status: "expired",
  },
  {
    id: "6",
    ref: "#49180",
    tenantName: "นายวิชัย ตั้งมั่น",
    location: "ล็อค B4 พื้นที่อาหารคาว",
    amount: 2800,
    date: "01/05/2568",
    status: "payment_submitted",
  },
];

export const envelopStats = {
  totalRevenue: 3210,
  availableSpaces: 4,
  pendingVerification: 7,
};
