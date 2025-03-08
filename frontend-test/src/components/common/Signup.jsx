import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Signup = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const HandleSignup = async (data) => {
    console.log(data);
    try {
      const resp = await axios.post("/api/signup", data);
      console.log(resp.data);
      if (resp.status === 200) {
        toast.success("Signup Success", {
          duration: 1500,
          position: "bottom-center",
          className: "bg-gray-500",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      toast.error("Error in Signin", {
        duration: 1500,
        position: "bottom-center",
      });

      console.log("Error in Signup" + error);
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
          <h2 className="text-4xl font-bold text-white">Expense Mate</h2>
          <p className="mt-2 text-gray-400">Sign up </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(HandleSignup)}>
          <div className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <FaUserAlt className="absolute top-3 left-3 text-gray-500 text-lg mt-1" />
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter your name"
                {...register("name", { required: true })}
              />
            </div>
            {/* Email Field */}
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-500 text-lg mt-1" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Email address"
                {...register("email", { required: true })}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-gray-500 text-lg mt-1" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Password"
                {...register("password", { required: true })}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-gray-300">
            <label className="flex items-center space-x-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded-md text-indigo-500 focus:ring-indigo-400 border-gray-600"
              />
              <span className="text-sm">Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-500 cursor-pointer"
          >
            Sign up
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:underline hover:text-indigo-300 transition-all"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
