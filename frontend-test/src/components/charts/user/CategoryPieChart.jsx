import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CategoryPieChart = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("pie");

  // Enhanced color palettes
  const incomeColors = [
    "#4F46E5", // Indigo-600
    "#6366F1", // Indigo-500
    "#818CF8", // Indigo-400
    "#2563EB", // Blue-600
    "#3B82F6", // Blue-500
    "#60A5FA", // Blue-400
    "#0EA5E9", // Sky-600
    "#38BDF8", // Sky-400
    "#7C3AED", // Violet-600
    "#8B5CF6", // Violet-500
    "#A78BFA", // Violet-400
    "#0D9488", // Teal-600
    "#14B8A6", // Teal-500
    "#2DD4BF", // Teal-400
  ];

  const expenseColors = [
    "#E11D48", // Rose-600
    "#F43F5E", // Rose-500
    "#FB7185", // Rose-400
    "#EF4444", // Red-500
    "#F87171", // Red-400
    "#EC4899", // Pink-600
    "#F472B6", // Pink-400
    "#D946EF", // Fuchsia-500
    "#E879F9", // Fuchsia-400
    "#C026D3", // Fuchsia-600
    "#EA580C", // Orange-600
    "#F97316", // Orange-500
    "#FB923C", // Orange-400
    "#CA8A04", // Yellow-600
  ];

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          throw new Error("User ID not found");
        }

        const { data } = await axios.get(
          `/api/analytics/categorywise-transactions/${userId}`
        );
        setCategoryData(data);
      } catch (err) {
        console.error("Category Chart Error:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to fetch category data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 12,
            weight: 500,
          },
          color: "#4B5563", // Gray-600
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937",
        bodyColor: "#1F2937",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce(
              (acc, current) => acc + current,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            const count = dataset.transactionCounts[context.dataIndex];
            return [
              `${label}: $${value.toLocaleString()} (${percentage}%)`,
              `Transactions: ${count}`,
            ];
          },
        },
      },
    },
    cutout: chartType === "doughnut" ? "60%" : 0,
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverBorderWidth: 0,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  // Enhanced loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-gray-500 text-sm font-medium">
            Loading category data...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl shadow-sm">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Helper function to render chart based on type
  const renderChart = (data) => {
    return chartType === "pie" ? (
      <Pie data={data} options={chartOptions} />
    ) : (
      <Doughnut data={data} options={chartOptions} />
    );
  };

  // Apply enhanced colors to income chart
  const incomeData = categoryData?.income && {
    labels: categoryData.income.labels,
    datasets: [
      {
        data: categoryData.income.datasets[0].data,
        backgroundColor: categoryData.income.labels.map(
          (_, i) => incomeColors[i % incomeColors.length]
        ),
        hoverBackgroundColor: categoryData.income.labels.map(
          (_, i) => incomeColors[i % incomeColors.length]
        ),
        borderColor: "#ffffff",
        transactionCounts: categoryData.income.datasets[0].transactionCounts,
      },
    ],
  };

  // Apply enhanced colors to expense chart
  const expenseData = categoryData?.expense && {
    labels: categoryData.expense.labels,
    datasets: [
      {
        data: categoryData.expense.datasets[0].data,
        backgroundColor: categoryData.expense.labels.map(
          (_, i) => expenseColors[i % expenseColors.length]
        ),
        hoverBackgroundColor: categoryData.expense.labels.map(
          (_, i) => expenseColors[i % expenseColors.length]
        ),
        borderColor: "#ffffff",
        transactionCounts: categoryData.expense.datasets[0].transactionCounts,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Chart Type Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              chartType === "pie"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pie
          </button>
          <button
            type="button"
            onClick={() => setChartType("doughnut")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              chartType === "doughnut"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Doughnut
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Income Categories Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Income Distribution
          </h3>
          <div className="h-[300px]">
            {categoryData?.income ? (
              renderChart(incomeData)
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No income data available
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Expense Distribution
          </h3>
          <div className="h-[300px]">
            {categoryData?.expense ? (
              renderChart(expenseData)
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
