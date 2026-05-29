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
        "mx-auto w-full max-w-[1280px] px-6 py-10 mt-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
