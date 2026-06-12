"use client";

import { cn } from "@/lib/utils";
import Breadcrumb from "./Breadcrumb";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
  withScrollbar?: boolean;
  withBreadcrumb?: boolean;
}

export default function PageContainer({
  children,
  className,
  withPadding = true,
  withScrollbar = true,
  withBreadcrumb = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full",
        withScrollbar && "h-screen overflow-y-auto custom-scrollbar",
        withPadding && "pt-20",
        className
      )}
    >
      {withBreadcrumb && withPadding && (
        <div className="px-6 pt-3 pb-1">
          <Breadcrumb />
        </div>
      )}
      {children}
    </div>
  );
}
