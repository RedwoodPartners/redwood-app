"use client";
import appwriteService from "@/appwrite/config";
import useAuth from "@/context/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const { setAuthStatus } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await appwriteService.logout();
        setAuthStatus(false);
        router.replace("/login"); 
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    performLogout();
  }, [router, setAuthStatus]);

  return <></>;
};

export default LogoutPage;
