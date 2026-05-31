"use client"

import { useState, useMemo } from "react";
import { Booking } from "../types/booking";

export function useBookingFilters(initialBookings: Booking[]) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

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
    // Unique categories from initial bookings
    return Array.from(new Set(initialBookings.map((b) => b.category)));
  }, [initialBookings]);

  const buildings = useMemo(() => {
    // Unique buildings from initial bookings
    return Array.from(new Set(initialBookings.map((b) => b.building)));
  }, [initialBookings]);

  const totalResults = filteredBookings.length;

  const handleAddBooking = (newBookingOrBookings: Booking | Booking[]) => {
    setBookings((prev) => {
      const newItems = Array.isArray(newBookingOrBookings) ? newBookingOrBookings : [newBookingOrBookings];
      return [...newItems, ...prev];
    });
  };

  const handleUpdateBookingStatus = (
    id: string,
    status:
      | "pending"
      | "pending_payment"
      | "verifying_payment"
      | "approved"
      | "rejected",
  ) => {
    setBookings((prev) => 
      prev.map((b) => b.id === id ? { ...b, status } : b)
    );
  };

  const handleEditBooking = (updatedBooking: Booking, mode: "this" | "following" | "all" = "this") => {
    setBookings((prev) => {
      if (!updatedBooking.recurringGroupId || mode === "this") {
        const target = updatedBooking.recurringGroupId && mode === "this"
          ? { ...updatedBooking, recurringGroupId: undefined }
          : updatedBooking;
        return prev.map((b) => b.id === target.id ? target : b);
      }

      const originalBooking = prev.find((b) => b.id === updatedBooking.id);
      const originalDate = originalBooking ? originalBooking.date : updatedBooking.date;

      return prev.map((b) => {
        if (b.recurringGroupId === updatedBooking.recurringGroupId) {
          const shouldUpdate =
            mode === "all" ||
            (mode === "following" && b.date >= originalDate);

          if (shouldUpdate) {
            return {
              ...updatedBooking,
              id: b.id,      // Keep original ID
              date: b.date,  // Keep original Date
            };
          }
        }
        return b;
      });
    });
  };

  const handleDeleteBooking = (
    idOrFilter: string | { id: string; recurringGroupId: string; mode: "this" | "following" | "all"; date: string }
  ) => {
    setBookings((prev) => {
      if (typeof idOrFilter === "string") {
        return prev.filter((b) => b.id !== idOrFilter);
      }
      const { id, recurringGroupId, mode, date } = idOrFilter;
      if (mode === "this") {
        return prev.filter((b) => b.id !== id);
      } else if (mode === "following") {
        return prev.filter((b) => !(b.recurringGroupId === recurringGroupId && b.date >= date));
      } else { // all
        return prev.filter((b) => b.recurringGroupId !== recurringGroupId);
      }
    });
  };

  return {
    bookings,
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
