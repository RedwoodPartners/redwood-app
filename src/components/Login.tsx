"use client";
import React, { FormEvent, useState } from "react";
import { loginUser } from "@/appwrite/config";
import useAuth from "@/context/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const { setAuthStatus } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const session = await loginUser(formData.email, formData.password); 
      if (session) {
        setAuthStatus(true);
        router.push("/profile");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side image 50% */}
      <div className="w-1/2 bg-gray-200 flex items-center justify-center">
        {/* Placeholder for image */}
        <div className="text-gray-400 text-5xl">🖼️</div>
      </div>

      {/* Right side form 50% */}
      <div className="flex w-1/2 flex-col items-center justify-center p-10 bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-center text-base text-gray-600 mb-6">
          Please enter your account details
        </p>
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={login} className="w-full max-w-sm">
          <input
            id="email"
            type="email"
            placeholder="Name/Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            className="block w-full mb-4 rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm text-gray-700">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-gray-700">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full mb-4 rounded-lg bg-black py-3 text-sm text-white hover:bg-gray-800"
          >
            Log In
          </button>
          <div className="flex items-center justify-center mb-4">
            <span className="text-sm text-gray-500">OR</span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-full rounded-lg border border-gray-300 py-3 text-sm text-gray-900 hover:bg-gray-100"
            onClick={() => console.log('Continue using Google clicked')}
          >
            <img src="/" alt="Google" className="h-5 w-5 mr-2" />
            Continue using Google
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?&nbsp;
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;