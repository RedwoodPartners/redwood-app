"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import useAuth from "@/context/useAuth";
import { Toaster } from "@/components/ui/toaster";
import BreadcrumbWithDynamicPath from "@/components/breadcrumblink";
import { Separator } from "@/components/ui/separator";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { authStatus } = useAuth();

  if (!authStatus) {
    router.replace("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full bg-gradient-to-b from-blue-50 via-pink-50 to-transparent">
        {/* Sidebar */}
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top Row: SidebarTrigger and Breadcrumb */}
          <div>
            <SidebarTrigger />
            {/*<Separator orientation="vertical" className="ml-1 -mr-2 h-4" />
            <div className="ml-4 flex-1">
              <BreadcrumbWithDynamicPath />
            </div>*/}
          </div>

          {/* Main Content */}
          <main>
            {children}
          </main>
        </div>
      </div>

      {/* Toaster Notifications */}
      <Toaster />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
