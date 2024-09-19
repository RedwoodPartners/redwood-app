"use client";
import appwriteService from "@/appwrite/config"; // Import the Appwrite service
import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import BUCKET_ID from "@/appwrite/config"; // Your Appwrite bucket ID

const ProfileCard = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch user data when the component loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await appwriteService.getCurrentUser();
        if (userData) {
          setUser(userData);
          if (userData.prefs?.profilePic) {
            setProfilePic(userData.prefs.profilePic); // Set profile picture from user preferences
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
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
      console.error("Error updating password:", error);
      setMessage("Error updating password. Please check your current password.");
    }
  };

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle profile picture upload and save
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Generate a local preview
      const fileUrl = URL.createObjectURL(file);
      setProfilePic(fileUrl);

      try {
        // Upload the file to Appwrite's storage bucket
        const fileUpload = await appwriteService.uploadFile(file);
        const fileId = fileUpload.$id;

        // Create a public URL for the file
        const profilePicUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${fileId}/view`;

        // Update the user's profile picture in preferences
        await appwriteService.updateUserProfilePicture(user?.$id || '', profilePicUrl);

        setMessage("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setMessage("Failed to upload profile picture.");
      }
    }
  };

  const handleProfilePicClick = () => {
    document.getElementById("fileInput")?.click(); // Trigger the hidden file input click
  };

  return (
    user && (
      <div className="flex flex-col items-center relative">
        {/* Logout button on top right */}
        <button
          className="absolute top-4 right-4 bg-red-500 text-white py-1 px-4 rounded-lg transition-transform duration-300 hover:scale-105"
          onClick={handleLogout}
        >
          Logout
        </button>

        <div className="rounded-lg p-8 w-full max-w-1.5xl min-h-[80vh]">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg cursor-pointer" onClick={handleProfilePicClick}>
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile Pic"
                className="w-full h-full object-cover"
              />
              {/* Hidden file input for image upload */}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {/* Edit Icon Overlay */}
              <div className="absolute inset-0 flex justify-center items-center">
                
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-800">{user.name}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <input
                type="text"
                placeholder="Enter your phone"
                className="w-full p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6">Change Password</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Current Password</p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Password</p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirm Password</p>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full mb-2 p-3 border rounded focus:ring focus:ring-blue-200 transition duration-300"
              />
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              className="bg-blue-500 text-white py-1 w-20 rounded-lg transition-transform duration-300 hover:scale-105"
              onClick={handlePasswordUpdate}
            >
              Save
            </button>
          </div>

          {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
      </div>
    )
  );
};

export default ProfileCard;
