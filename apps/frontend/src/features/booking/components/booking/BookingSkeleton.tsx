"use client"

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
  return (
    <div className="w-full h-[380px] bg-white rounded-[7px] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
      {/* Image Area Skeleton */}
      <Skeleton className="h-44 w-full" />
      
      {/* Content Area Skeleton */}
      <div className="p-5 flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-10 rounded-[7px]" />
          <Skeleton className="h-10 rounded-[7px]" />
        </div>
        
        <div className="pt-2">
          <Skeleton className="h-10 w-full rounded-[7px]" />
        </div>
      </div>
    </div>
  );
}

export function BookingGridSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {[1, 2, 3, 4].map((j) => (
              <BookingCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
