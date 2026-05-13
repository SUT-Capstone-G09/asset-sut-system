"use client"

import { useState, useMemo } from "react";
import { Location } from "../types/location";
import { mockLocations } from "../data/locations";

export function useAreaFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const filteredLocations = useMemo(() => {
    return mockLocations.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(filteredLocations.map((loc) => loc.category)));
  }, [filteredLocations]);

  const totalResults = filteredLocations.length;

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleResetFilters,
    filteredLocations,
    categories,
    totalResults
  };
}
