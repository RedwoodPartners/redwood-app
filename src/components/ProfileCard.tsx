"use client";
import appwriteService from "@/appwrite/config";
import { Models } from "appwrite";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProfileCard = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await appwriteService.getCurrentUser();
      if (userData) setUser(userData);
    };
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex gap-y-6 flex-wrap">
      {/* User Info */}
      <div className="flex w-full gap-x-4 items-center">
        <div className="shrink-0 w-20">
          {/* Add Profile Picture here */}
        </div>
        <div className="relative">
          <p className="font-bold text-xl w-full mb-1">{user.name}</p>
          <div className="text-[12px] p-0.5 inline-block rounded-md bg-gradient-to-tr from-primary to-secondary">
            <button className="px-2 rounded-md font-bold bg-white">FREE</button>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="bg-gray-200/70 rounded-xl px-8 py-8 w-full flex gap-y-4 flex-wrap">
        <UserProfileField label="Display Name" value={user.name} />
        <UserProfileField label="Email Id" value={user.email} />
        <UserProfileField label="Phone Number" value="999-888-7777" />
        <UserProfileField label="Password" value="********" />
      </div>

      {/* Logout Button */}
      <div className="w-full flex justify-center">
        <Link
          href="/logout"
          className="bg-gray-200/70 rounded-xl px-6 py-3 inline-block hover:bg-gray-100 duration-150"
        >
          Logout
        </Link>
      </div>
    </div>
  );
};

const UserProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="relative w-full">
    <p className="text-sm text-gray-700">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default ProfileCard;
