import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function SectionHeader({ icon, label, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-100 text-brand-primary">
        {icon}
      </div>
      <h2 className="font-bold text-gray-900">{label}</h2>
    </div>
  );
}
