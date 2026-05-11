import React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItemType[];
}

export function AssetBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {!isLast && item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="hover:text-[#E9652B] transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className={isLast ? "text-[#E9652B] font-bold" : ""}>
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/*
 * Example Usage:
 * =======================
 * import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb"
 * 
 * export default function Page() {
 *   return (
 *     <AssetBreadcrumb 
 *       items={[
 *         { label: "หน้าหลัก", href: "/" },
 *         { label: "ระบบจัดการคำร้อง", href: "/requests" },
 *         { label: "แดชบอร์ด" } // The last item doesn't need an `href` and will be styled as active
 *       ]} 
 *     />
 *   )
 * }
 */
