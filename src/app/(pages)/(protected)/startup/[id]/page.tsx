"use client";

import React from "react";
import StartupDetailsPage from "@/components/Collections/view/StartupDetailsPage";
import GenerateReport from "@/components/generate";

const ViewStartupPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);

  return (
    <>
      <StartupDetailsPage startupId={id} />
      <GenerateReport startupId={id} />
    </>
  );
};

export default ViewStartupPage;
