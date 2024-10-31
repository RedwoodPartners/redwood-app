"use client";

import React from "react";
import StartupDetailsPage from "@/components/Collections/view/StartupDetailsPage";

const ViewStartupPage = ({ params }: { params: { id: string } }) => {
  return <StartupDetailsPage startupId={params.id} />;
};

export default ViewStartupPage;
