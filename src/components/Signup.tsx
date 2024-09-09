"use client";
import React, { FormEvent, useState } from "react";
import appwriteService from "@/appwrite/config";
import useAuth from "@/context/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";


const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthStatus } = useAuth();

  const create = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const userData = await appwriteService.createUserAccount(formData);
      if (userData) {
        setAuthStatus(true);
        router.push("/profile");
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-gray-200 flex items-center justify-center">
        <div className="text-gray-400 text-5xl">🖼️</div>
      </div>

      <div className="flex w-1/2 flex-col items-center justify-center bg-white relative">
        <Link href="/login" className="absolute top-4 right-4 text-sm text-gray-500">
          Login
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
        <p className="text-center text-base text-gray-600 mb-6">
          Enter your email below to create your account
        </p>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={create} className="w-full max-w-sm">
          <input
            id="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900"
            required
          />
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900"
            required
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900"
            required
          />
          <button
            type="submit"
            className="w-full mb-4 rounded-lg bg-black py-3 text-sm text-white hover:bg-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
          <div className="flex items-center justify-center mb-4">
            <span className="text-sm text-gray-500">OR</span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-full rounded-lg border border-gray-300 py-3 text-sm text-gray-900 hover:bg-gray-100"
          >
            <img src="/path-to-google-icon.png" alt="Google" className="h-5 w-5 mr-2" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
