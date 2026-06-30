import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the layout of EmailTemplateForm so the loading state matches the shape
// of the real content (3 fields, variable hints, editor, footer actions).
export default function EmailTemplateFormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-7 w-64" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
        <Skeleton className="h-3 w-48" />
        <div className="flex flex-wrap gap-1.5">
          {[16, 24, 20, 28].map((w, i) => (
            <Skeleton key={i} className="h-5" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>

      <Skeleton className="h-[70vh] w-full rounded-lg" />

      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
}
