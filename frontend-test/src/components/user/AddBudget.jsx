import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaMoneyBillWave, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { format } from "date-fns";
import { startOfMonth, endOfMonth, parse } from "date-fns";
import Chatbot from "../Chatbot";

const AddBudget = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [useMonthSelection, setUseMonthSelection] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchBudgets = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const response = await axios.get(`/api/budgets/user/${userId}`);

      setBudgets(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBudgets();

    // Add global refresh function for the chatbot to call
    window.refreshBudgets = () => {
      fetchBudgets();
    };

    // Cleanup on unmount
    return () => {
      delete window.refreshBudgets;
    };
  }, []);

  useEffect(() => {
    if (useMonthSelection) {
      const currentDate = new Date();
      const currentMonthYear = format(currentDate, "yyyy-MM");
      handleMonthChange(currentMonthYear);
    }
  }, [useMonthSelection]);

  const handleDeleteBudget = async (budgetId) => {
    try {
      await axios.delete(`/api/budgets/${budgetId}`);
      toast.success("Budget deleted successfully!");
      fetchBudgets();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete budget");
    }
  };

  const handleMonthChange = (monthYear) => {
    if (!monthYear) return;

    try {
      const date = parse(monthYear, "yyyy-MM", new Date());
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      setValue("start_date", format(start, "yyyy-MM-dd"));
      setValue("end_date", format(end, "yyyy-MM-dd"));
    } catch (error) {
      console.error("Date parsing error:", error);
      toast.error("Invalid date selection");
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("user_id");

      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date selection");
      }

      const budgetData = {
        ...data,
        user_id: userId,
        amount: parseFloat(data.amount),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };

      const response = await axios.post("/api/budgets", budgetData);

      if (response.status === 200) {
        toast.success("Budget created successfully!");
        reset();
        fetchBudgets();
      }
    } catch (error) {
      console.error("Budget creation error:", error);
      toast.error(error.response?.data?.detail || "Failed to create budget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl mx-auto">
        {/* Existing Budgets Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Current Budgets
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {budget.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {budget.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${budget.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(budget.start_date), "MMM dd, yyyy")} -{" "}
                        {format(new Date(budget.end_date), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {budgets.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No budgets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Budget Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Create New Budget
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Title
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monthly Budget"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Amount
              </label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Date Range Fields */}
            <div className="space-y-4">
              {/* Month Selection Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useMonthSelection"
                  checked={useMonthSelection}
                  onChange={(e) => setUseMonthSelection(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="useMonthSelection"
                  className="text-sm text-gray-600"
                >
                  Use Month Selection
                </label>
              </div>

              {useMonthSelection ? (
                // Month Selector
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Month
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="month"
                      {...register("month", {
                        onChange: (e) => handleMonthChange(e.target.value),
                      })}
                      className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={format(new Date(), "yyyy-MM")}
                    />
                  </div>
                </div>
              ) : (
                // Manual Date Selection
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="date"
                        {...register("start_date", {
                          required: "Start date is required",
                        })}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="date"
                        {...register("end_date", {
                          required: "End date is required",
                        })}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.end_date.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows="4"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Budget description (optional)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Budget"}
            </button>
          </form>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default AddBudget;
