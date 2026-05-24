import { Skeleton } from "@/components/ui/skeleton";

export function UploadZoneSkeleton() {
  return (
    <div className="upload-zone flex flex-col items-center justify-center p-8 m-4 rounded-2xl bg-slate-50/50 border-2 border-dashed">
      <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
      <Skeleton className="h-5 w-48 mb-1" />
      <Skeleton className="h-4 w-96 mb-6" />
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  );
}
