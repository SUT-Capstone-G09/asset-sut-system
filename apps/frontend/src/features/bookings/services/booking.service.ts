import { apiClient } from "@/lib/services/api-client";
import { MyBooking, BookingStatus } from "@/features/bookings/data/mock-my-bookings";

export interface TimeslotInput {
  location_id: number;
  date: string; // ISO string
  start_time: string; // ISO string
  end_time: string; // ISO string
  is_full_day?: boolean;
  addon_ids?: number[];
}

// วัตถุประสงค์การขอใช้พื้นที่โถง 1 ข้อ (ตรงกับ dto.BookingPurposeInput ฝั่ง backend)
export interface BookingPurposeInput {
  hall_usage_purpose_id: number;
  selected_cells?: number[][]; // per_sqm: [[row,col], ...]
  product_type_count?: number; // per_type_per_day: จำนวนประเภทสินค้า
  product_names?: string[]; // per_type_per_day: ชื่อสินค้าที่จะแจก (1 ชื่อต่อ 1 ประเภท)
  proposed_price?: number | null; // ราคาที่เสนอ (optional; backend คุมให้ ≥ เกณฑ์ระบบ)
}

export interface CreateBookingPayload {
  purpose: string;
  timeslots: TimeslotInput[];
  purposes?: BookingPurposeInput[]; // ถ้ามี = การจองพื้นที่โถง (คิดราคาจากวัตถุประสงค์)
}

export interface UpdateBookingStatusPayload {
  status_id?: number;
  status?: string;
  note?: string;
}

export interface TimeslotResponseDTO {
  id: number;
  location_id: number;
  location_name: string;
  location_image?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  is_full_day: boolean;
  price_snapshot: number;
  status: string;
  addons: { id: number; addon_name: string; applied_price: number; quantity: number; total_price: number }[];
}

export interface BookingResponseDTO {
  id: number;
  user_id: number;
  user_name: string;
  requester_name?: string;
  requester_id?: string;
  requester_type?: string;
  contact_phone?: string;
  contact_email?: string;
  purpose: string;
  base_price: number;
  addon_price: number;
  total_price: number;
  status: string;
  status_id: number;
  timeslots: TimeslotResponseDTO[];
  booking_addons?: {
    id: number;
    addon_name: string;
    applied_price: number;
    quantity: number;
    total_price: number;
  }[];
  status_logs: {
    id: number;
    from_status: string;
    to_status: string;
    changed_by: number;
    changed_by_name: string;
    changed_at: string;
    note: string;
  }[];
  documents?: {
    id: number;
    booking_id: number;
    document_type_id: number;
    document_type: string;
    file_name: string;
    file_url: string;
    content_type: string;
    method: string;
    created_at: string;
  }[];
  purposes?: BookingPurposeResponseDTO[]; // วัตถุประสงค์การขอใช้พื้นที่โถง (per_sqm มี selected_cells)
  created_at: string;
}

// วัตถุประสงค์การขอใช้พื้นที่โถง 1 ข้อ (snapshot) — ตรงกับ dto.BookingPurposeResponse ฝั่ง backend
export interface BookingPurposeResponseDTO {
  id: number;
  hall_usage_purpose_id: number;
  purpose_name: string;
  pricing_model: string; // "per_sqm" | "per_type_per_day"
  selected_cells?: number[][]; // per_sqm: [[row,col], ...]
  area_sqm?: number;
  product_type_count?: number;
  product_names?: string[];
  unit_price_snapshot: number;
  computed_price: number;
  proposed_price?: number;
  total_price: number;
}

export async function getMyBookings(): Promise<BookingResponseDTO[]> {
  const data = await apiClient.get<BookingResponseDTO[] | null>("/bookings/my");
  return data ?? [];
}

export async function getAllBookings(): Promise<BookingResponseDTO[]> {
  const data = await apiClient.get<BookingResponseDTO[] | null>("/bookings");
  return data ?? [];
}

export async function getBookingById(id: number): Promise<BookingResponseDTO> {
  return apiClient.get<BookingResponseDTO>(`/bookings/${id}`);
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponseDTO> {
  return apiClient.post<BookingResponseDTO>("/bookings", payload);
}

export async function updateBookingStatus(
  id: number,
  payload: UpdateBookingStatusPayload
): Promise<BookingResponseDTO> {
  return apiClient.put<BookingResponseDTO>(`/bookings/${id}/status`, payload);
}

export interface TimeslotExpensesPayload {
  timeslot_id: number;
  expenses: {
    addon_name: string;
    applied_price: number;
    quantity: number;
  }[];
}

export interface UpdateBookingExpensesPayload {
  is_waived: boolean;
  timeslots: TimeslotExpensesPayload[];
}

export async function updateBookingExpenses(
  id: number,
  payload: UpdateBookingExpensesPayload
): Promise<BookingResponseDTO> {
  return apiClient.put<BookingResponseDTO>(`/bookings/${id}/expenses`, payload);
}

// Map backend status strings to Thai UI labels
const STATUS_MAP: Record<string, BookingStatus> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
  rejected: "ปฏิเสธ",
};

export function bookingDTOtoMyBooking(b: BookingResponseDTO): MyBooking {
  const firstSlot = b.timeslots?.[0];
  const locationName = firstSlot?.location_name ?? "ห้อง";
  const date = firstSlot ? new Date(firstSlot.date) : new Date(b.created_at);
  const startTime = firstSlot
    ? new Date(firstSlot.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "–";
  const endTime = firstSlot
    ? new Date(firstSlot.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "–";

  const dateStr = date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const status: BookingStatus = STATUS_MAP[b.status] ?? "รออนุมัติ";
  const needsPayment = b.status === "approved";

  return {
    id: `BK-${b.id}`,
    bookingId: b.id,
    room: {
      name: locationName,
      building: firstSlot ? `Location #${firstSlot.location_id}` : "–",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    },
    date: dateStr,
    startTime,
    endTime,
    price: b.total_price,
    status,
    needsPayment,
  };
}
