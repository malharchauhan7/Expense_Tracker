import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaWallet,
  FaChartLine,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";
import { format } from "date-fns";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    NoOfactiveUsers: 0,
    ActiveUsers: [],
    totalTransactions: 0,
    ActiveTransactions: [],
    flaggedTransactions: 0,
  });

  useEffect(() => {
    HandleGetAllDashboardAnalytics();
  }, []);

  const HandleGetAllDashboardAnalytics = async () => {
    try {
      const respUsers = await axios.get("/api/analytics/users/");
      const respTransactions = await axios.get("api/analytics/transactions/");
      // console.log(respTransactions.data);
      // console.log(respUsers.data);
      const sortedUsers = [...respUsers.data.ActiveUsers].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      const sortedTransactions = [
        ...respTransactions.data.Activetransactions,
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setStats({
        totalUsers: respUsers.data.TotalUsers,
        ActiveUsers: sortedUsers,
        NoOfactiveUsers: respUsers.data.NoOfActiveUsers,
        ActiveTransactions: sortedTransactions,
        totalTransactions: respTransactions.data.TotalTransactions,
        flaggedTransactions: respTransactions.data.NoOfInActiveTransactions,
      });
    } catch (error) {
      console.error(error);
    }
  };

  console.log(stats);

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
          value={stats.NoOfactiveUsers}
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
                {stats.ActiveUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">{user.name}</td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === true
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status === true ? "active" : "inactive"}
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
                {stats.ActiveTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">{transaction.user_id.name}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.transaction_type === "Expense"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.transaction_type === "Expense"
                          ? "expense"
                          : "income"}
                      </span>
                    </td>
                    <td className="py-4 px-4">${transaction.amount}</td>
                    <td className="py-4 px-4">
                      {transaction.category_id.name}
                    </td>
                    <td className="py-4 px-4">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </td>
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
