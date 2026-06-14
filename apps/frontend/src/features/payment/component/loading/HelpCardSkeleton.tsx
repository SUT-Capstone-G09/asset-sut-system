import { Skeleton } from "@/components/ui/skeleton";

export function HelpCardSkeleton() {
  return (
    <div className="bg-orange-50/70 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
