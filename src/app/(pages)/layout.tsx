"use client";
import appwriteService from "@/appwrite/config";
import { AuthProvider } from "@/context/authContext";
import React, { useEffect, useState } from "react";

const ProtectedLayout = ({
    children,
  }: {
    children: React.ReactNode
  }) => {

    const [authStatus, setAuthStatus] = useState(false);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        appwriteService.isLoggedIn()
        .then(setAuthStatus)
        .finally(() => setLoader(false));
    }, []);

    return <AuthProvider value={{ authStatus, setAuthStatus }}>
            {!loader && (
                <>
                    <main className="px-2 py-4">{children}</main>
                </>
            )}
        </AuthProvider>

}

export default ProtectedLayout;