"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import appwriteService from "@/appwrite/config";
import { Models } from "appwrite";

const HomePage = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await appwriteService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await appwriteService.logout();
    setUser(null); // Reset user state
    router.replace("/login"); // Navigate to login page
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="w-full bg-blue-600 shadow-md p-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Logo</h1>
          <div>
            <a href="/admin" className="text-white mx-3 hover:underline">Home</a>
            <a href="/about" className="text-white mx-3 hover:underline">About</a>
            <a href="/contact" className="text-white mx-3 hover:underline">Contact</a>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Welcome Message */}
      <div className="mt-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Welcome Back, {user?.name}!</h2>
        <p className="mt-4 text-gray-600">We're glad to see you again. Explore the links above to continue.</p>
      </div>
    </div>
  );
};

export default HomePage;
