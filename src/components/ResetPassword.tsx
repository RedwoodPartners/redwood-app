"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import { useRouter } from "next/navigation"; 
import appwriteService from "@/appwrite/config";

const ForgotPassword = () => {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appwriteService.sendPasswordResetEmail(email); 
      setMessage("Password reset link sent to your email!");
    } catch (error) {
      setMessage("Error sending password reset email");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side image 50% */}
      <div className="w-1/2 flex justify-center">
        <Image src="/login.jpg" alt="Forgot Password" width={800} height={600} className="opacity-70" />
      </div>

      {/* Right side form 50% */}
      <div className="flex w-1/2 flex-col items-center justify-center p-10 bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-center text-base text-gray-600 mb-6">
          No worries! Just enter your email below, and we’ll send you a link to reset your password.
        </p>
        {message && <p className="text-red-600 mb-4 text-center">{message}</p>}
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            className="w-full mb-4 rounded-lg bg-black py-3 text-sm text-white hover:bg-gray-800"
            type="submit"
          >
            Reset Password
          </button>
        </form>
        <button
          className="mt-4 text-blue-500"
          onClick={() => router.push("/login")} 
        >
          &larr; Back to log in
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
