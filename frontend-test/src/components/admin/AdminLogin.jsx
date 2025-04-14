import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Loader = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
  </div>
);

const AdminLogin = () => {
  const { register, handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/login", data);

      if (response.status === 200) {
        toast.success("Login successful!", {
          duration: 1500,
          position: "bottom-center",
        });

        localStorage.setItem("user_id", response.data._id);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("isAdmin", "true");

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid admin credentials",
        {
          duration: 1500,
          position: "bottom-center",
        }
      );
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div>
        <Toaster />
      </div>
      <div className="bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Admin Login</h2>
          <p className="mt-2 text-gray-400">Sign in to admin dashboard</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-500 text-lg" />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Admin email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-gray-500 text-lg" />
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-gray-300">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-md text-indigo-500 focus:ring-indigo-400 border-gray-600"
              />
              <span className="text-sm">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : "Sign In"}
          </button>

          {/* Back to User Login */}
          <p className="text-center text-sm text-gray-300">
            Not an admin?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:underline hover:text-indigo-300 transition-all"
            >
              User Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
