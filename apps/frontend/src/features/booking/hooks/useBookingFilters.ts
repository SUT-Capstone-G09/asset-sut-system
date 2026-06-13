"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { Booking } from "../types/booking";
import { AdminLocationDTO, getLocations } from "../services/locationService";
import {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  updateBookingExpenses,
  BookingResponseDTO,
  CreateBookingPayload,
} from "../../bookings/services/booking.service";

const statusMapToId: Record<string, number> = {
  pending: 1,
  approved: 2,
  rejected: 3,
  cancelled: 4,
  completed: 5,
  pending_payment: 6,
  verifying_payment: 7,
};

function bookingDTOToAdminBooking(b: BookingResponseDTO, locationsMap: Map<number, AdminLocationDTO>): Booking {
  const firstSlot = b.timeslots?.[0];
  const locId = firstSlot?.location_id;
  const loc = locId ? locationsMap.get(locId) : undefined;

  const date = firstSlot ? new Date(firstSlot.date).toISOString().split("T")[0] : "";
  const startTime = firstSlot
    ? new Date(firstSlot.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  const endTime = firstSlot
    ? new Date(firstSlot.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";
  const timeSlot = startTime && endTime ? `${startTime} - ${endTime} น.` : "";

  let status: Booking["status"] = "pending";
  if (b.status === "approved") status = "approved";
  else if (b.status === "rejected") status = "rejected";
  else if (b.status === "pending_payment") status = "pending_payment";
  else if (b.status === "verifying_payment") status = "verifying_payment";

  // Parse housekeeper details from saved booking addons if any
  let housekeeperPrice = 0;
  let housekeeperCount = 0;
  const hkAddon = b.booking_addons?.find(a => a.addon_name.startsWith("ค่าแม่บ้าน"));
  if (hkAddon) {
    const match = hkAddon.addon_name.match(/ค่าแม่บ้าน\s*\((\d+)\s*บาท\/คน\s*x\s*(\d+)\s*คน\)/);
    if (match) {
      housekeeperPrice = parseInt(match[1], 10);
      housekeeperCount = parseInt(match[2], 10);
    } else {
      housekeeperPrice = hkAddon.applied_price;
      housekeeperCount = hkAddon.quantity;
    }
  }

  return {
    id: String(b.id),
    roomName: loc?.name ?? firstSlot?.location_name ?? "ไม่ทราบชื่อห้อง",
    roomNumber: loc?.room_number ? String(loc.room_number) : "",
    building: loc?.building ?? "",
    category: loc?.type ?? "",
    requesterName: b.requester_name || b.user_name || "ไม่ทราบชื่อ",
    requesterId: b.requester_id || String(b.user_id),
    requesterType: (b.requester_type as any) || "student",
    purpose: b.purpose,
    date,
    timeSlot,
    status,
    attendees: loc?.capacity ?? 1,
    image: loc?.image_url ?? firstSlot?.location_image ?? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date(b.created_at).toLocaleDateString("th-TH") + " " + new Date(b.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น.",
    notes: "",
    contactPhone: b.contact_phone || "—",
    contactEmail: b.contact_email || "—",
    equipment: [],
    expenses: (b.booking_addons || []).map((addon) => ({
      name: addon.addon_name,
      amount: addon.total_price,
    })),
    attachedDocuments: [],
    housekeeperPrice,
    housekeeperCount,
  };
}

export function useBookingFilters(type: "classroom" | "meeting" | "all") {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<AdminLocationDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsData, locationsData] = await Promise.all([
        getAllBookings(),
        getLocations(),
      ]);
      setLocations(locationsData);
      
      const locMap = new Map<number, AdminLocationDTO>();
      locationsData.forEach((loc) => locMap.set(loc.id, loc));
      
      const mappedBookings = bookingsData.map((b) => bookingDTOToAdminBooking(b, locMap));
      
      // Filter by classroom vs meeting categories
      const classroomCategories = ["ห้องบรรยาย", "ห้องปฏิบัติการ", "ห้องสัมมนา"];
      const filtered = mappedBookings.filter((b) => {
        if (type === "all") return true;
        const isClassroom = classroomCategories.some(
          (cat) => b.category.includes(cat) || cat.includes(b.category)
        );
        return type === "classroom" ? isClassroom : !isClassroom;
      });
      
      setBookings(filtered);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedBuilding("all");
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const matchesSearch = 
        item.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requesterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesBuilding = selectedBuilding === "all" || item.building === selectedBuilding;

      return matchesSearch && matchesCategory && matchesStatus && matchesBuilding;
    });
  }, [bookings, searchQuery, selectedCategory, selectedStatus, selectedBuilding]);

  const categories = useMemo(() => {
    return Array.from(new Set(bookings.map((b) => b.category).filter(Boolean)));
  }, [bookings]);

  const buildings = useMemo(() => {
    return Array.from(new Set(bookings.map((b) => b.building).filter(Boolean)));
  }, [bookings]);

  const totalResults = filteredBookings.length;

  const handleAddBooking = async (newBookingOrBookings: Booking | Booking[]) => {
    const newBookings = Array.isArray(newBookingOrBookings) ? newBookingOrBookings : [newBookingOrBookings];

    for (const newBooking of newBookings) {
      const location = locations.find(
        (l) => l.name === newBooking.roomName || String(l.room_number) === newBooking.roomNumber
      );
      if (!location) {
        throw new Error(`ไม่พบสถานที่: ${newBooking.roomName}`);
      }

      const timeMatch = newBooking.timeSlot.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (!timeMatch) {
        throw new Error(`รูปแบบช่วงเวลาไม่ถูกต้อง: ${newBooking.timeSlot}`);
      }
      const startTimeStr = timeMatch[1];
      const endTimeStr = timeMatch[2];

      const dateStr = newBooking.date; 
      const startTimeISO = new Date(`${dateStr}T${startTimeStr}:00`).toISOString();
      const endTimeISO = new Date(`${dateStr}T${endTimeStr}:00`).toISOString();

      const payload: CreateBookingPayload = {
        purpose: newBooking.purpose,
        timeslots: [
          {
            location_id: location.id,
            date: new Date(`${dateStr}T00:00:00`).toISOString(),
            start_time: startTimeISO,
            end_time: endTimeISO,
            addon_ids: [],
          },
        ],
      };

      const created = await createBooking(payload);

      const locMap = new Map<number, AdminLocationDTO>();
      locations.forEach((l) => locMap.set(l.id, l));
      const mapped = bookingDTOToAdminBooking(created, locMap);
      setBookings((prev) => [mapped, ...prev]);
    }
  };

  const handleUpdateBookingStatus = async (
    id: string,
    status:
      | "pending"
      | "pending_payment"
      | "verifying_payment"
      | "approved"
      | "rejected",
  ) => {
    await updateBookingStatus(Number(id), { status });
    await fetchAll();
  };

  const handleEditBooking = async (updatedBooking: Booking) => {
    await updateBookingStatus(Number(updatedBooking.id), { status: updatedBooking.status });
    if (updatedBooking.expenses) {
      await updateBookingExpenses(Number(updatedBooking.id), {
        expenses: updatedBooking.expenses.map((exp) => ({
          addon_name: exp.name,
          applied_price: exp.amount,
          quantity: 1,
        })),
      });
    }
    await fetchAll();
  };

  const handleDeleteBooking = async (idOrFilter: string | { id: string }) => {
    const id = typeof idOrFilter === "string" ? idOrFilter : idOrFilter.id;
    // Note: Backend setup doesn't have a direct delete booking endpoint, 
    // so we delete from local state.
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return {
    bookings,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedBuilding,
    setSelectedBuilding,
    handleResetFilters,
    filteredBookings,
    categories,
    buildings,
    totalResults,
    handleAddBooking,
    handleUpdateBookingStatus,
    handleEditBooking,
    handleDeleteBooking
  };
}
