"use client";
import appwriteService from "@/appwrite/config"; 
import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Updated import for next/navigation
import BUCKET_ID from "@/appwrite/config"; 

const ProfileCard = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await appwriteService.getCurrentUser();
        if (userData) {
          setUser(userData);
          setName(userData.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Handle password update only
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      await appwriteService.updatePassword(currentPassword, newPassword);
      setMessage("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
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
        const fileUpload = await appwriteService.uploadFile(file);
        const fileId = fileUpload.$id;
        const profilePicUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view`;
        await appwriteService.updateUserProfilePicture(user?.$id || '', profilePicUrl);
        setMessage("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setMessage("Failed to upload profile picture.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      setMessage("Logged out successfully!");
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Error logging out:", error);
      setMessage("Error logging out. Please try again.");
    }
  };

  const handleGoHome = () => {
    router.push("/home"); 
  };

  return (
    user && (
      <div className="flex flex-col items-center relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-gray-100 text-gray-600 py-2 px-4 rounded hover:bg-gray-200 transition duration-300"
        >
          Logout
        </button>
        
        <div className="border-2 border-gray-200 rounded-lg p-6 mt-16 w-full max-w-5xl min-h-[70vh] shadow-md">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg cursor-pointer">
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile Pic"
                className="w-full h-full object-cover"
              />
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{user.name}</p>
              <p className="text-base text-gray-600">{user.email}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition duration-300"
                disabled
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <input
                type="email"
                value={user.email} 
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition duration-300"
                disabled
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6">Change Password</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Password</p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Password</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirm Password</p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <button
              className="bg-blue-500 text-white py-2 px-6 rounded-lg transition-transform duration-300 hover:scale-105"
              onClick={handlePasswordUpdate}
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-gray-600 py-2 px-6 rounded-lg transition-transform duration-300 hover:scale-105"
              onClick={handleGoHome}
            >
              Home
            </button>
          </div>

          {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
      </div>
    )
  );
};

export default ProfileCard;
