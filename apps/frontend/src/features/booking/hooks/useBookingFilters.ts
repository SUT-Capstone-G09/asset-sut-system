"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Booking } from "../types/booking";
import { AdminLocationDTO, getLocations, getStaffBuildings } from "../services/locationService";
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
};

export function bookingDTOToAdminBooking(b: BookingResponseDTO, locationsMap: Map<number, AdminLocationDTO>): Booking {
  const firstSlot = b.timeslots?.[0];
  const locId = firstSlot?.location_id;
  const loc = locId ? locationsMap.get(locId) : undefined;

  // Format date as Thai พ.ศ.
  const formatThaiDate = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

  const date = firstSlot ? formatThaiDate(firstSlot.date) : "";
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
  else if (b.status === "cancelled") status = "cancelled";
  else if (b.status === "completed") status = "completed";

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
    basePrice: b.base_price || 0,
    totalPrice: b.total_price || 0,
    discountPrice: 0,
    roomName: loc?.name || firstSlot?.location_name || "ไม่ระบุห้อง",
    roomNumber: loc?.room_number ? String(loc.room_number) : "",
    // Falls back to a label (never "") — BookingGrid groups the list by
    // building, and an empty string gets stripped by the buildings list's
    // .filter(Boolean), which makes the whole grid disappear whenever every
    // booking in view happens to be on a location with no building set.
    building: loc?.building || "ไม่ระบุอาคาร",
    category: loc?.type ?? "",
    requesterName: b.requester_name || b.user_name || "ไม่ทราบชื่อ",
    requesterId: b.requester_id || String(b.user_id),
    requesterType: (b.requester_type as any) || "student",
    purpose: b.purpose,
    date,
    rawDate: firstSlot ? firstSlot.date : "",
    rawTimeslots: b.timeslots || [],
    timeSlot,
    status,
    attendees: loc?.capacity ?? 1,
    image: loc?.image_url ?? firstSlot?.location_image ?? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date(b.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) + " " + new Date(b.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น.",
    notes: "",
    contactPhone: b.contact_phone || "—",
    contactEmail: b.contact_email || "—",
    equipment: [],
    expenses: (b.booking_addons || []).map((addon) => ({
      name: addon.addon_name,
      unitPrice: addon.applied_price,
      quantity: addon.quantity,
      amount: addon.total_price,
    })),
    timeslots: (b.timeslots || []).map((ts) => {
      const tsDate = new Date(ts.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
      const tsStart = new Date(ts.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
      const tsEnd = new Date(ts.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
      return {
        id: ts.id,
        date: tsDate,
        timeSlot: `${tsStart} - ${tsEnd} น.`,
        priceSnapshot: ts.price_snapshot,
        expenses: (ts.addons || []).map((addon) => ({
          name: addon.addon_name,
          unitPrice: addon.applied_price,
          quantity: addon.quantity,
          amount: addon.total_price,
        })),
      };
    }),
    attachedDocuments: (b.documents || []).map((doc) => doc.file_url),
    housekeeperPrice,
    housekeeperCount,
    locationId: locId,
    hallPurposes: (b.purposes || []).map((p) => ({
      id: p.id,
      hallUsagePurposeId: p.hall_usage_purpose_id,
      purposeName: p.purpose_name,
      pricingModel: p.pricing_model,
      selectedCells: p.selected_cells,
      areaSqm: p.area_sqm,
      productTypeCount: p.product_type_count,
      productNames: p.product_names,
      proposedPrice: p.proposed_price,
      computedPrice: p.computed_price,
      totalPrice: p.total_price,
    })),
  };
}

export type BookingTypeFilter = "classroom" | "meeting" | "sport" | "hall" | "all";

// location_types in the DB is more granular than the 4 top-level cards shown
// in the admin booking selection page — group each raw type into its card's
// bucket (per each card's own description) instead of comparing it verbatim,
// otherwise bookings on any subtype room (e.g. "ห้องประชุมขนาดเล็ก",
// "พื้นที่สาธารณะ") silently disappear from every card's count.
const rawTypeToBucket: Record<string, Exclude<BookingTypeFilter, "all">> = {
  "ห้องเรียน": "classroom",
  "ห้องบรรยาย": "classroom",
  "ห้องปฏิบัติการ": "classroom",
  "ห้องสัมมนา": "classroom",
  "อื่นๆ": "classroom",
  "ห้องประชุม": "meeting",
  "ห้องประชุมขนาดเล็ก": "meeting",
  "ห้องประชุมขนาดกลาง": "meeting",
  "ห้องประชุมขนาดใหญ่": "meeting",
  "พื้นที่สาธารณะ": "meeting",
  "สนามกีฬา": "sport",
  "โถงอาคาร": "hall",
};

export function getBookingTypeBucket(rawType: string): BookingTypeFilter | undefined {
  return rawTypeToBucket[rawType];
}

export function useBookingFilters(type: BookingTypeFilter, staffUserId?: number) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<AdminLocationDTO[]>([]);
  const [searchQueryState, setSearchQueryState] = useState(searchParams.get("q") || "");
  const [selectedCategoryState, setSelectedCategoryState] = useState(searchParams.get("category") || "all");
  const [selectedStatusState, setSelectedStatusState] = useState(searchParams.get("status") || "all");
  const [selectedBuildingState, setSelectedBuildingState] = useState(searchParams.get("building") || "all");
  const [loading, setLoading] = useState(true);

  // Sync state from URL (important for Back navigation)
  useEffect(() => {
    setSearchQueryState(searchParams.get("q") || "");
    setSelectedCategoryState(searchParams.get("category") || "all");
    setSelectedStatusState(searchParams.get("status") || "all");
    setSelectedBuildingState(searchParams.get("building") || "all");
  }, [searchParams]);

  // Helper to sync state to URL
  const updateQueryParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const searchQuery = searchQueryState;
  const selectedCategory = selectedCategoryState;
  const selectedStatus = selectedStatusState;
  const selectedBuilding = selectedBuildingState;

  const setSearchQuery = (val: string) => {
    setSearchQueryState(val);
    updateQueryParam("q", val);
  };
  const setSelectedCategory = (val: string) => {
    setSelectedCategoryState(val);
    updateQueryParam("category", val);
  };
  const setSelectedStatus = (val: string) => {
    setSelectedStatusState(val);
    updateQueryParam("status", val);
  };
  const setSelectedBuilding = (val: string) => {
    setSelectedBuildingState(val);
    updateQueryParam("building", val);
  };

  // The admin booking page keeps this hook mounted across category switches
  // (only the "type" query param changes), so filters left over from a
  // previous category would otherwise silently hide everything in the next
  // one — reset them (and their URL params) whenever the active category
  // changes.
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedBuilding("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [allBookingsData, locationsData, staffBuildings] = await Promise.all([
        getAllBookings(),
        getLocations(),
        staffUserId ? getStaffBuildings(staffUserId) : Promise.resolve(null),
      ]);
      setLocations(locationsData);

      const locMap = new Map<number, AdminLocationDTO>();
      locationsData.forEach((loc) => locMap.set(loc.id, loc));

      let bookingsData = allBookingsData ?? [];

      if (staffUserId && staffBuildings) {
        const allowedBuildingIds = new Set(staffBuildings.map((b: any) => b.id));
        const locationToBuildingMap = new Map<number, number | undefined>();
        locationsData.forEach((loc) => locationToBuildingMap.set(loc.id, loc.building_id));

        bookingsData = bookingsData.filter((booking) => {
          return booking.timeslots?.some((ts) => {
            const buildingId = locationToBuildingMap.get(ts.location_id);
            return buildingId !== undefined && allowedBuildingIds.has(buildingId);
          });
        });
      }

      const mappedBookings = bookingsData.map((b) => bookingDTOToAdminBooking(b, locMap));

      const filtered = mappedBookings.filter((b) => {
        if (type === "all") return true;
        return getBookingTypeBucket(b.category) === type;
      });

      setBookings(filtered);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [type, staffUserId]);

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
      if (endTimeStr <= startTimeStr) {
        throw new Error("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
      }

      const dateStr = newBooking.date;
      // Explicit +07:00 (Bangkok) offset — see BookingConfirmView.tsx for why:
      // the backend reads the clock-time component directly to decide
      // office-hours vs. off-peak pricing, so this must not go through the
      // browser's local timezone via toISOString().
      const startTimeISO = `${dateStr}T${startTimeStr}:00+07:00`;
      const endTimeISO = `${dateStr}T${endTimeStr}:00+07:00`;

      const payload: CreateBookingPayload = {
        purpose: newBooking.purpose,
        timeslots: [
          {
            location_id: location.id,
            date: `${dateStr}T00:00:00+07:00`,
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
      | "approved"
      | "rejected"
      | "cancelled"
      | "completed",
  ) => {
    await updateBookingStatus(Number(id), { status });
    await fetchAll();
  };

  const handleEditBooking = async (updatedBooking: Booking) => {
    await updateBookingStatus(Number(updatedBooking.id), { status: updatedBooking.status });
    if (updatedBooking.timeslots && updatedBooking.timeslots.length > 0) {
      await updateBookingExpenses(Number(updatedBooking.id), {
        is_waived: false,
        timeslots: updatedBooking.timeslots.map((ts) => ({
          timeslot_id: ts.id,
          expenses: ts.expenses.map((exp) => ({
            addon_name: exp.name,
            applied_price: exp.unitPrice,
            quantity: exp.quantity,
          })),
        })),
      });
    } else {
      await updateBookingExpenses(Number(updatedBooking.id), {
        is_waived: false,
        timeslots: [
          {
            timeslot_id: 0,
            expenses: (updatedBooking.expenses || []).map((exp) => ({
              addon_name: exp.name,
              applied_price: exp.unitPrice,
              quantity: exp.quantity,
            })),
          },
        ],
      });
    }
    await fetchAll();
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
  };
}
