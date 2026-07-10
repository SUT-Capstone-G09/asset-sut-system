"use client"

import { useState, useMemo } from "react";
import { RentalSpace } from "../types/rental-space";
import { mockLocations } from "../data/mock-rental-spaces";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useAreaFilters(locations: RentalSpace[] = mockLocations) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  const setSelectedCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(pathname);
  };

  const filteredLocations = useMemo(() => {
    return locations.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.building ?? "").toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      
      const matchesCategory = selectedCategory === "all" || item.area === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(locations.map((loc) => loc.area)));
  }, [locations]);

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