"use client";
import appwriteService from "@/appwrite/config";
import { AuthProvider, User } from "@/context/authContext";
import React, { useEffect, useState } from "react";

const ProtectedLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authStatus, setAuthStatus] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    appwriteService.isLoggedIn()
      .then((status: boolean) => {
        setAuthStatus(status);
        if (status) {
          appwriteService.getCurrentUser()
            .then((userData: User | null) => setUser(userData))
            .catch(() => setUser(null));
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoader(false));
  }, []);
  

  return (
    <AuthProvider value={{ authStatus, setAuthStatus, user, setUser }}>
      {!loader && (
        <main>{children}</main>
      )}
    </AuthProvider>
  );
};

export default ProtectedLayout;
