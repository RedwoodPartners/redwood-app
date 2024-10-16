import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import appwriteService from "@/appwrite/config";
import { Models } from "appwrite";
import * as Popover from "@radix-ui/react-popover"; // Radix UI Popover for dropdown
import Image from "next/image";

const Navbar = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await appwriteService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          router.push("/login"); // Redirect to login if no user data
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Unable to fetch user data. Redirecting to login...");
        setTimeout(() => {
          router.push("/login"); // Optional delay for better UX
        }, 2000);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Error logging out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center mb-20 bg-slate-50">
      {/* Navigation Bar */}
      <nav className="w-full shadow-md p-3 bg-white fixed top-0 z-50">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          {/* Logo and Links */}
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-gray-800">Logo</h1>
            <a href="/admin" className="text-gray-800 hover:text-blue-600">
              Home
            </a>

            {/* Tables Dropdown */}
            <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <Popover.Trigger asChild>
                <button
                  className="text-gray-800 hover:text-blue-600"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                >
                  Tables
                </button>
              </Popover.Trigger>

              <Popover.Content
                className="z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none"
                align="start"
                sideOffset={8}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)} 
              >
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => router.push("/startup")}
                  >
                    Startups
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => router.push("/projects")}
                  >
                    Projects
                  </button>
                </div>
              </Popover.Content>
            </Popover.Root>

            <a href="/about" className="text-gray-800 hover:text-blue-600">
              About
            </a>
            <a href="/contact" className="text-gray-800 hover:text-blue-600">
              Contact
            </a>
          </div>

          {/* Search bar and Avatar */}
          <div className="mr-5 flex items-center space-x-1">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="flex h-9 mr-3 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[100px] lg:w-[300px]"
              />
            </div>

            {/* Avatar with Popover */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-8 rounded-full"
                  type="button"
                >
                  <span className="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10">
                    <Image
                      className="aspect-square h-full w-full"
                      alt={`@${user?.name || "user"}`}
                      src="/avatar.png"
                      width={32}
                      height={32}
                    />
                  </span>
                </button>
              </Popover.Trigger>

              <Popover.Content
                className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md"
                align="end"
                sideOffset={8}
              >
                <div className="px-2 py-1.5 text-sm font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div role="separator" aria-orientation="horizontal" className="-mx-1 my-1 h-px bg-muted" />

                {/* Dropdown Options */}
                <div role="group">
                  <button
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </button>
                  <button
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
                    onClick={() => router.push("/settings")}
                  >
                    Settings
                  </button>
                  <button
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-100"
                    onClick={() => router.push("/notifications")}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={handleLogout}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors focus:bg-red-500 focus:text-white"
                  >
                    Logout
                  </button>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
