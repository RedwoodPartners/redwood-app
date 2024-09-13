"use client";
import React, { FormEvent, useState } from "react";
import appwriteService from "@/appwrite/config";
import useAuth from "@/context/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const { setAuthStatus } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const session = await appwriteService.login(formData);
      if (session) {
        setAuthStatus(true);
        router.push("/profile");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await appwriteService.loginWithGoogle("/profile", "/login");
      setLoading(false);
      setAuthStatus(true);
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side image 50% */}
      <div className="w-1/2 flex  justify-center">
          <Image src="/login.jpg" alt="img" width={800} height={600} className="opacity-70"/>
          <div className="absolute text-center text-slate-700">
              <h2 className="text-4xl font-bold mb-4 mt-64 text-center"></h2>
              <p className="text-lg"></p>
          </div>
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
            <Link href="/resetpassword" className="text-sm text-gray-700">
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
            className="google-btn flex items-center justify-center w-full rounded-lg border border-gray-300 py-3 text-sm text-gray-900 hover:bg-gray-100"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
              viewBox="0 0 256 262"
              className="h-5 w-5 mr-2"
            >
              <path
                fill="#4285F4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              />
              <path
                fill="#34A853"
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              />
              <path
                fill="#FBBC05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
              />
              <path
                fill="#EB4335"
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              />
            </svg>
            Continue with Google
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
