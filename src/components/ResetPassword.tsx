"use client";

import React, { useState } from "react";
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Forgot Password?</h1>
        <p className="mb-4">
          No worries! Just enter your email address below, and we’ll send you a link to reset your password.
        </p>
        {message && <p className="mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            required
          />
          <button className="w-full bg-black text-white py-2 rounded" type="submit">
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
