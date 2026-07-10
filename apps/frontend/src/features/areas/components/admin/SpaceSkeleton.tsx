"use client"

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SpaceCardSkeleton() {
  return (
    <div className="w-[300px] h-[360px] bg-white rounded-[7px] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
      {/* Image Area Skeleton */}
      <Skeleton className="h-48 w-full" />
      
      {/* Content Area Skeleton */}
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SpaceGridSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {[1, 2, 3, 4].map((j) => (
              <SpaceCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
