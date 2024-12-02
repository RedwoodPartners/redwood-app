"use client";

import React from "react";
import StartupDetailsPage from "@/components/Collections/view/StartupDetailsPage";
import GenerateReport from "@/components/generate";

const ViewStartupPage = ({ params }: { params: { id: string } }) => {
  return (
  <>
  <StartupDetailsPage startupId={params.id} />
  <GenerateReport startupId={params.id} />
  </>
)};

export default ViewStartupPage;
