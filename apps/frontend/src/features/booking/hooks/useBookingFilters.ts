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

  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: "pending" | "approved" | "rejected") => {
    setBookings((prev) => 
      prev.map((b) => b.id === id ? { ...b, status } : b)
    );
  };

  const handleEditBooking = (updatedBooking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => b.id === updatedBooking.id ? updatedBooking : b)
    );
  };

  const handleDeleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
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
