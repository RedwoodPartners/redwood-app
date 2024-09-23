"use client";

import React from "react";
import { useRouter } from "next/navigation"; 
import ResetPassword from "@/components/ResetPassword"; 
import useAuth from "@/context/useAuth";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { authStatus } = useAuth();

  if (authStatus) {
    router.replace("/home");
    return <></>; 
  }

  return <ResetPassword />;
};

export default ResetPasswordPage;
