import React, { useState } from "react";
import {
  FaLock,
  FaBell,
  FaPalette,
  FaDollarSign,
  FaLanguage,
} from "react-icons/fa";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("security");

  const settingsSections = {
    security: <SecuritySettings />,
    notifications: <NotificationSettings />,
    preferences: <PreferenceSettings />,
    currency: <CurrencySettings />,
    language: <LanguageSettings />,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm">
          {/* Settings Navigation */}

          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap space-x-4 px-6">
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "security"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaLock />
                  <span>Security</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "notifications"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaBell />
                  <span>Notifications</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("preferences")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "preferences"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaPalette />
                  <span>Preferences</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("currency")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "currency"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaDollarSign />
                  <span>Currency</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("language")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "language"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaLanguage />
                  <span>Language</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-6">{settingsSections[activeTab]}</div>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Notification Preferences
      </h2>
      <div className="space-y-4">
        {[
          "Email Notifications",
          "Push Notifications",
          "Budget Alerts",
          "Payment Reminders",
        ].map((setting) => (
          <div key={setting} className="flex items-center justify-between">
            <span className="text-gray-700">{setting}</span>
            <label className="switch">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Preference Settings Component
const PreferenceSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Display Preferences
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select className="w-full p-3 border border-gray-200 rounded-lg">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Currency Settings Component
const CurrencySettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Currency Settings</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Currency
        </label>
        <select className="w-full p-3 border border-gray-200 rounded-lg">
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="JPY">JPY - Japanese Yen</option>
        </select>
      </div>
    </div>
  );
};

// Language Settings Component
const LanguageSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Language Settings</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Language
        </label>
        <select className="w-full p-3 border border-gray-200 rounded-lg">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );
};

export default UserSettings;
