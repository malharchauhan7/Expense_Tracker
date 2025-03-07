import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const HandleLogin = async (data) => {
    console.log(data);
    try {
      const resp = await axios.post("/api/login", data);
      console.log(resp.data);
      if (resp.status === 200) {
        toast.success("Login Success", {
          duration: 1500,
          position: "bottom-center",
          className: "bg-gray-500",
        });
        if (resp.data.isAdmin === true) {
          setTimeout(() => {
            navigate("/admin");
          }, 2000);
          localStorage.setItem("user_id", resp.data._id);
          localStorage.setItem("name", resp.data.name);
          localStorage.setItem("isAdmin", resp.data.isAdmin);
        } else {
          setTimeout(() => {
            navigate("/user");
          }, 2000);
          localStorage.setItem("user_id", resp.data._id);
          localStorage.setItem("name", resp.data.name);
          localStorage.setItem("isAdmin", resp.data.isAdmin);
        }
      }
    } catch (error) {
      toast.error("User Not Found", {
        duration: 1500,
        position: "bottom-center",
      });
      console.log("Error in login" + error);
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
          <h2 className="text-4xl font-bold text-white">Welcome Back!</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(HandleLogin)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-500 text-lg" />
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
              <FaLock className="absolute top-3 left-3 text-gray-500 text-lg" />
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
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:ring-2 hover:ring-indigo-500 cursor-pointer"
          >
            Sign in
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-400 font-semibold hover:underline hover:text-indigo-300 transition-all"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
