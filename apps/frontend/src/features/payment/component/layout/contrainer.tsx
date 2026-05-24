import { cn } from "@/lib/utils";

type ContrainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PaymentPageContrainer({
  children,
  className,
}: ContrainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto w-full max-w-7xl px-2 md:px-4 lg:px-6 mt-20 pt-6 mb-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
