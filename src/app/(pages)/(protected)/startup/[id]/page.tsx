"use client";

import React from "react";
import StartupDetailsPage from "@/components/Collections/view/StartupDetailsPage";
import Sidebar from "@/components/menu";
import Navbar from "@/components/Navbar";

const View: React.FC<{ params: { id: string } }> = ({ params }) => {
    const { id } = params; 

    return (
        <div>
            <Sidebar />
            <Navbar />
            
            {/* Pass the 'id' as a prop to the StartupDetailsPage component */}
            <StartupDetailsPage startupId={id} />
        </div>
    );
};

export default View;
