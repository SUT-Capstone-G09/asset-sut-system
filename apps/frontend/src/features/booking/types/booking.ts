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
  status: "pending" | "approved" | "rejected";
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
}

