
import React from "react";
import ProjectViewPage from "@/components/Collections/view/ProjectViewPage";

const Page = ({ params }: { params: { id: string } }) => {
  return <ProjectViewPage id={params.id} />;
};

export default Page;
