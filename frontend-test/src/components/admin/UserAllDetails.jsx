import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaUser,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaList,
} from "react-icons/fa";
import axios from "axios";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

const UserAllDetails = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/admin/user-details/${userId}`);
      setUserData(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to fetch user details"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="bottom-right" />

      {/* User Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaUser className="text-blue-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {userData.user.name}
            </h1>
            <p className="text-gray-500">{userData.user.email}</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaWallet className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-800">
                ${userData.stats.total_balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaArrowUp className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-800">
                ${userData.stats.total_income.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaArrowDown className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-800">
                ${userData.stats.total_expense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Income Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaList className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Income Categories ({userData.categories.income.length})
            </h2>
          </div>
          <div className="space-y-2">
            {userData.categories.income.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <span className="text-gray-800">{category.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    category.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.status ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaList className="text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Expense Categories ({userData.categories.expense.length})
            </h2>
          </div>
          <div className="space-y-2">
            {userData.categories.expense.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <span className="text-gray-800">{category.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    category.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.status ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budgets Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Active Budgets ({userData.budgets.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData.budgets.map((budget) => (
            <div
              key={budget.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{budget.title}</h3>
                <span className="text-lg font-bold text-blue-600">
                  ${budget.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {budget.description || "No description provided"}
              </p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {format(new Date(budget.start_date), "MMM dd, yyyy")} -{" "}
                  {format(new Date(budget.end_date), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          ))}
          {userData.budgets.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No active budgets found
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        transaction.transaction_type === "Income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.transaction_type === "Income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.transaction_type === "Income" ? "+" : "-"}$
                    {transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAllDetails;
