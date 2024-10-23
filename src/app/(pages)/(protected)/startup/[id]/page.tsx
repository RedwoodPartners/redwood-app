"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import StartupDetailsPage from "@/components/Collections/view/StartupDetailsPage";
import { AppSidebar } from "@/components/app-sidebar";

const View: React.FC<{ params: { id: string } }> = ({ params }) => {
    const { id } = params; 

    return (
        <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
      </main>
      <StartupDetailsPage startupId={id} />
    </SidebarProvider>
        
    );
};

export default View;
