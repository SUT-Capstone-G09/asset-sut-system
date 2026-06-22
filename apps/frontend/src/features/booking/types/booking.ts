export interface BookingExpense {
  name: string;
  amount: number;
}

export interface Booking {
  id: string;
  roomName: string;
  roomNumber: string;
  building: string;
  category: string; // e.g., "ห้องบรรยาย", "ห้องปฏิบัติการ", "ห้องประชุมขนาดใหญ่", etc.
  requesterName: string;
  requesterId: string;
  requesterType: "student" | "staff" | "external";
  purpose: string;
  date: string;
  timeSlot: string; // e.g., "09:00 - 12:00 น."
  status: "pending" | "pending_payment" | "verifying_payment" | "approved" | "rejected";
  attendees: number;
  image: string;
  createdAt: string;
  notes?: string;
  contactPhone?: string;
  contactEmail?: string;
  equipment?: string[];
  expenses?: BookingExpense[];
  attachedDocuments?: string[];
  receiptImage?: string;
  officialReceipt?: string;
  housekeeperPrice?: number;
  housekeeperCount?: number;
  recurringGroupId?: string;
  expenseStatus?: "draft" | "sent";
  repeat?: boolean;
  repeatFrequency?: "daily" | "weekly" | "monthly" | "custom";
  repeatCustomInterval?: number;
  repeatCustomUnit?: "day" | "week" | "month";
  repeatDaysOfWeek?: number[];
  repeatEndDateType?: "none" | "date" | "count";
  repeatEndDate?: string;
  repeatEndCount?: number;
}

export interface StatusConfigItem {
  label: string;
  color: string;      // for BookingCard badge color
  dot: string;        // for BookingCard dot
  cardText: string;   // for BookingCard text
  gridText: string;   // for BookingGrid text
  gridBg: string;     // for BookingGrid bg
  drawerText: string; // for BookingDrawer text
  drawerBg: string;   // for BookingDrawer bg
  drawerDot: string;  // for BookingDrawer dot
}

export const BOOKING_STATUS_CONFIG: Record<Booking["status"], StatusConfigItem> = {
  pending: {
    label: "รออนุมัติ",
    color: "bg-amber-50/90 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
    cardText: "text-amber-700",
    gridText: "text-amber-600",
    gridBg: "bg-amber-50 border-amber-100",
    drawerText: "text-amber-700",
    drawerBg: "bg-amber-50 border-amber-100",
    drawerDot: "bg-amber-500",
  },
  pending_payment: {
    label: "รอชำระเงิน",
    color: "bg-sky-50/90 text-sky-700 border-sky-100",
    dot: "bg-sky-500",
    cardText: "text-sky-700",
    gridText: "text-sky-600",
    gridBg: "bg-sky-50 border-sky-100",
    drawerText: "text-sky-700",
    drawerBg: "bg-sky-50 border-sky-100",
    drawerDot: "bg-sky-500",
  },
  verifying_payment: {
    label: "รอตรวจสอบการชำระเงิน",
    color: "bg-indigo-50/90 text-indigo-700 border-indigo-100",
    dot: "bg-indigo-500",
    cardText: "text-indigo-700",
    gridText: "text-indigo-600",
    gridBg: "bg-indigo-50 border-indigo-100",
    drawerText: "text-indigo-700",
    drawerBg: "bg-indigo-50 border-indigo-100",
    drawerDot: "bg-indigo-500",
  },
  approved: {
    label: "อนุมัติแล้ว",
    color: "bg-emerald-50/90 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    cardText: "text-emerald-700",
    gridText: "text-emerald-600",
    gridBg: "bg-emerald-50 border-emerald-100",
    drawerText: "text-emerald-700",
    drawerBg: "bg-emerald-50 border-emerald-100",
    drawerDot: "bg-emerald-500",
  },
  rejected: {
    label: "ปฏิเสธ",
    color: "bg-red-50/90 text-red-500 border-red-100",
    dot: "bg-red-400",
    cardText: "text-red-500",
    gridText: "text-red-600",
    gridBg: "bg-red-50 border-red-100",
    drawerText: "text-red-700",
    drawerBg: "bg-red-50 border-red-100",
    drawerDot: "bg-red-500",
  },
};
