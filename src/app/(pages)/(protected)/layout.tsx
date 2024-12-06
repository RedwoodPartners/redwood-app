"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import useAuth from "@/context/useAuth";
import { Toaster } from "@/components/ui/toaster"

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { authStatus } = useAuth();

  if (!authStatus) {
    router.replace("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="container flex">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content area with SidebarTrigger */}
        <main className="w-full">
          <SidebarTrigger/>
          <div >
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
