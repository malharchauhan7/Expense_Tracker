import React, { useState, useEffect } from "react";
import axios from "axios";
import MonthlyCharts from "./MonthlyCharts";
import FinancialSuggestions from "./FinancialSuggestions";
import CategoryPieChart from "./CategoryPieChart";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Chatbot from "../../Chatbot";

const FinancialDashboard = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const { data } = await axios.get(`/api/financial-suggestions/${userId}`);

      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportDashboard = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`/api/export/dashboard/${userId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `financial_dashboard_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Dashboard exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export dashboard");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Financial Dashboard
        </h1>
        <button
          onClick={handleExportDashboard}
          className="px-4 py-2 flex items-center space-x-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <FaDownload className="text-gray-400" />
          <span>Export</span>
        </button>
      </div>

      {/* Financial Suggestions Section */}
      <div className="mb-8">
        <FinancialSuggestions suggestions={suggestions} />
      </div>
      {/* Monthly Charts Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Monthly Analysis
          </h2>
          <MonthlyCharts />
        </div>
      </div>
      {/* Category Distribution Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Category Distribution
        </h2>
        <CategoryPieChart />
      </div>

      {/* Add the Chatbot component */}
      <Chatbot />
    </div>
  );
};

export default FinancialDashboard;
