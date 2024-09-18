"use client";
import appwriteService from "@/appwrite/config";
import { Models } from "appwrite";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProfileCard = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const userData = await appwriteService.getCurrentUser();
      if (userData) {
        setUser(userData);
        // Fetch and set the user's profile picture if available
        if (userData.prefs?.profilePic) {
          setProfilePic(userData.prefs.profilePic);
        }
      }
    })();
  }, []);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      await appwriteService.updatePassword(currentPassword, newPassword);
      setMessage("Password updated successfully!");
      setEditingPassword(false);
    } catch (error) {
      setMessage("Error updating password. Please check your current password.");
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setProfilePic(fileUrl);

      try {
        // Upload the file and get the file ID
        const fileId = await appwriteService.uploadProfilePicture(file);
        // Update the user's profile with the new profile picture URL
        const profilePicUrl = `https://cloud.appwrite.io/v1/storage/buckets/66eb0cfc000e821db4d9/files/${fileId}/view`;
        await appwriteService.updateUserProfilePicture(user?.$id || '', profilePicUrl);
        alert("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setMessage("Failed to upload profile picture.");
      }
    }
  };

  return (
    user && (
      <div className="flex flex-col items-center gap-8 p-8 bg-gray-50 min-h-screen">
        {/* Profile Section */}
        <div className="relative">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
            <img
              src={profilePic || "/default-profile.png"}
              alt="Profile Pic"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full cursor-pointer transition duration-300 hover:bg-gray-300">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </label>
        </div>

        {/* User Details */}
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{user.name}</p>
          <p className="text-gray-600 mt-2">{user.email}</p>
        </div>

        {/* User Info Section */}
        <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Display Name</p>
              <p className="font-semibold text-lg">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>

            {/* Password Update */}
            <div>
              <p className="text-sm text-gray-500">Password</p>
              {editingPassword ? (
                <>
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white w-full py-2 rounded-lg transition-transform duration-300 hover:scale-105"
                    onClick={handlePasswordUpdate}
                  >
                    Update Password
                  </button>
                  {message && <p className="text-red-500 mt-2">{message}</p>}
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg">********</p>
                  <button
                    className="text-blue-500 underline hover:text-blue-700 transition duration-300"
                    onClick={() => setEditingPassword(true)}
                  >
                    Edit Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Link
          href="/logout"
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </Link>
      </div>
    )
  );
};

export default ProfileCard;
