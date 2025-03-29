import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const OTPModal = ({ isOpen, onClose, onVerify, isLoading, email }) => {
  const [otpValue, setOtpValue] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerification = async () => {
    if (!otpValue || otpValue.length < 3) {
      toast.error("Please enter a valid OTP");
      return;
    }

    try {
      setLocalLoading(true);
      const data = {
        email: email,
        otpcode: otpValue,
      };

      const resp = await axios.post("/api/verify-otp", data);

      if (resp.data.success) {
        // toast.success("OTP verified successfully!", {
        //   duration: 1500,
        //   position: "bottom-center",
        // });

        setOtpValue("");
        onVerify(true);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP", {
        duration: 1500,
        position: "bottom-center",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs   flex items-center justify-center z-50 rounded-2xl">
      <div className="bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
        <h3 className="text-xl text-white mb-4">Enter OTP</h3>
        <p className="text-gray-400 text-sm mb-4">
          Please enter the verification code sent to your email
        </p>

        <input
          type="text"
          maxLength="6"
          className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter 4-digit OTP"
          value={otpValue}
          onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
        />

        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
            disabled={localLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleVerification}
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            disabled={localLoading || !otpValue}
          >
            {localLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
