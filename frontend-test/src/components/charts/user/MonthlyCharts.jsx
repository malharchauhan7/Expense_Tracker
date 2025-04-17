import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlyCharts = () => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("line");

  // Color themes
  const incomeColors = {
    primary: "#4F46E5", // Indigo-600
    secondary: "#818CF8", // Indigo-400
    gradient: ["rgba(79, 70, 229, 0.8)", "rgba(79, 70, 229, 0.1)"],
    point: "#312E81", // Indigo-900
  };

  const expenseColors = {
    primary: "#E11D48", // Rose-600
    secondary: "#FB7185", // Rose-400
    gradient: ["rgba(225, 29, 72, 0.8)", "rgba(225, 29, 72, 0.1)"],
    point: "#881337", // Rose-900
  };

  const balanceColors = {
    primary: "#0EA5E9", // Sky-600
    secondary: "#38BDF8", // Sky-400
    gradient: ["rgba(14, 165, 233, 0.8)", "rgba(14, 165, 233, 0.1)"],
    point: "#0C4A6E", // Sky-900
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          throw new Error("User ID not found");
        }

        const { data } = await axios.get(
          `http://localhost:8000/api/analytics/monthly-transactions/${userId}`
        );
        console.log(data);
        setMonthlyData(data);
      } catch (err) {
        console.error("Monthly Charts Error:", err);
        setError("Failed to fetch monthly data");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: $${context.parsed.y.toLocaleString()}`;
          },
          labelPointStyle: function () {
            return {
              pointStyle: "circle",
              rotation: 0,
            };
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Income vs Expenses",
        color: "#1f2937",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(243, 244, 246, 0.6)",
          drawBorder: false,
        },
        border: {
          dash: [5, 5],
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: {
            size: 11,
          },
          padding: 10,
        },
        title: {
          display: true,
          text: "Amount ($)",
          color: "#6B7280",
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 10,
        },
        title: {
          display: true,
          text: "Month",
          color: "#6B7280",
          font: {
            size: 12,
            weight: 500,
          },
          padding: {
            top: 10,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
        borderWidth: 2,
      },
    },
  };

  // Bar chart options
  const barChartOptions = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        ...lineChartOptions.plugins.title,
        text: "Monthly Financial Comparison",
      },
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
    scales: {
      ...lineChartOptions.scales,
      x: {
        ...lineChartOptions.scales.x,
        stacked: false,
      },
      y: {
        ...lineChartOptions.scales.y,
        stacked: false,
      },
    },
  };

  // Stacked bar chart options
  const stackedBarChartOptions = {
    ...barChartOptions,
    plugins: {
      ...barChartOptions.plugins,
      title: {
        ...barChartOptions.plugins.title,
        text: "Monthly Income & Expenses (Stacked)",
      },
    },
    scales: {
      ...barChartOptions.scales,
      x: {
        ...barChartOptions.scales.x,
        stacked: true,
      },
      y: {
        ...barChartOptions.scales.y,
        stacked: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-gray-500 text-sm font-medium">
            Loading financial data...
          </p>
        </div>
      </div>
    );
  }

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

  // Create gradient backgrounds for line chart
  const createGradient = (ctx, colors) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  };

  // Calculate balance data (income - expenses)
  const calculateBalanceData = () => {
    if (
      !monthlyData?.datasets?.[0]?.data ||
      !monthlyData?.datasets?.[1]?.data
    ) {
      return [];
    }

    return monthlyData.datasets[0].data.map((income, index) => {
      const expense = monthlyData.datasets[1].data[index] || 0;
      return income - expense;
    });
  };

  const lineChartData = {
    labels: monthlyData?.labels || [],
    datasets: [
      {
        label: "Income",
        data: monthlyData?.datasets[0]?.data || [],
        borderColor: incomeColors.primary,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return incomeColors.secondary;
          }
          return createGradient(ctx, incomeColors.gradient);
        },
        pointBackgroundColor: incomeColors.point,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: incomeColors.primary,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      {
        label: "Expenses",
        data: monthlyData?.datasets[1]?.data || [],
        borderColor: expenseColors.primary,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return expenseColors.secondary;
          }
          return createGradient(ctx, expenseColors.gradient);
        },
        pointBackgroundColor: expenseColors.point,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: expenseColors.primary,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const barChartData = {
    labels: monthlyData?.labels || [],
    datasets: [
      {
        label: "Income",
        data: monthlyData?.datasets[0]?.data || [],
        backgroundColor: incomeColors.primary + "CC", // 80% opacity
        borderColor: incomeColors.primary,
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: incomeColors.primary,
      },
      {
        label: "Expenses",
        data: monthlyData?.datasets[1]?.data || [],
        backgroundColor: expenseColors.primary + "CC", // 80% opacity
        borderColor: expenseColors.primary,
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: expenseColors.primary,
      },
    ],
  };

  const balanceChartData = {
    labels: monthlyData?.labels || [],
    datasets: [
      {
        label: "Net Balance",
        data: calculateBalanceData(),
        backgroundColor: function (context) {
          const value = context.raw;
          return value >= 0
            ? balanceColors.primary + "CC"
            : expenseColors.primary + "CC";
        },
        borderColor: function (context) {
          const value = context.raw;
          return value >= 0 ? balanceColors.primary : expenseColors.primary;
        },
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const renderActiveChart = () => {
    switch (activeChart) {
      case "line":
        return <Line data={lineChartData} options={lineChartOptions} />;
      case "bar":
        return <Bar data={barChartData} options={barChartOptions} />;
      case "stackedBar":
        return <Bar data={barChartData} options={stackedBarChartOptions} />;
      case "balanceBar":
        return <Bar data={balanceChartData} options={barChartOptions} />;
      default:
        return <Line data={lineChartData} options={lineChartOptions} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Chart Type Selector */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveChart("line")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              activeChart === "line"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setActiveChart("bar")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              activeChart === "bar"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bar
          </button>
          <button
            type="button"
            onClick={() => setActiveChart("stackedBar")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              activeChart === "stackedBar"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stacked
          </button>
          <button
            type="button"
            onClick={() => setActiveChart("balanceBar")}
            className={`relative inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
              activeChart === "balanceBar"
                ? "bg-white text-gray-700 shadow-sm rounded-md z-10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Balance
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="h-[450px]">{renderActiveChart()}</div>
      </div>
    </div>
  );
};

export default MonthlyCharts;
