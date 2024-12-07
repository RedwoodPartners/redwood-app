"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Convert path to breadcrumb items
function generateBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
  }));
}

export default function BreadcrumbWithDynamicPath() {
  const pathname = usePathname(); // Get the current pathname

  // Safeguard to avoid SSR issues
  if (!pathname) return null;

  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>
            <Link href="/home">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
        {/* Dynamically render breadcrumb links */}
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
    </>
  );
}
