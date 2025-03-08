import React, { useState } from "react";
import {
  FaUsers,
  FaWallet,
  FaChartLine,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy data - replace with real data
  const stats = {
    totalUsers: 1234,
    activeUsers: 892,
    totalTransactions: 5678,
    flaggedTransactions: 23,
  };

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "inactive",
    },
    // Add more users
  ];

  const recentTransactions = [
    {
      id: 1,
      user: "John Doe",
      type: "expense",
      amount: 299.99,
      category: "Electronics",
      date: "2024-02-20",
    },
    {
      id: 2,
      user: "Jane Smith",
      type: "income",
      amount: 5000,
      category: "Salary",
      date: "2024-02-19",
    },
    // Add more transactions
  ];

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {React.cloneElement(icon, { className: `text-xl ${color}` })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your application and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          color="text-blue-600"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<FaUsers />}
          color="text-green-600"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<FaWallet />}
          color="text-purple-600"
        />
        <StatCard
          title="Flagged Transactions"
          value={stats.flaggedTransactions}
          icon={<FaExclamationTriangle />}
          color="text-red-600"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "transactions"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Transactions
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4">Name</th>
                  <th className="text-left py-4 px-4">Email</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">{user.name}</td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-700">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4">User</th>
                  <th className="text-left py-4 px-4">Type</th>
                  <th className="text-left py-4 px-4">Amount</th>
                  <th className="text-left py-4 px-4">Category</th>
                  <th className="text-left py-4 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">{transaction.user}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === "expense"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">${transaction.amount}</td>
                    <td className="py-4 px-4">{transaction.category}</td>
                    <td className="py-4 px-4">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
