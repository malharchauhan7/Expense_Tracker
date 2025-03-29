import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CategoryPieChart = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Income Categories Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Income Distribution
        </h3>
        <div className="h-[300px]">
          {categoryData?.income && (
            <Pie
              data={{
                labels: categoryData.income.labels,
                datasets: [
                  {
                    data: categoryData.income.datasets[0].data,
                    backgroundColor:
                      categoryData.income.datasets[0].backgroundColor,
                    transactionCounts:
                      categoryData.income.datasets[0].transactionCounts,
                  },
                ],
              }}
              options={chartOptions}
            />
          )}
        </div>
      </div>

      {/* Expense Categories Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Expense Distribution
        </h3>
        <div className="h-[300px]">
          {categoryData?.expense && (
            <Pie
              data={{
                labels: categoryData.expense.labels,
                datasets: [
                  {
                    data: categoryData.expense.datasets[0].data,
                    backgroundColor:
                      categoryData.expense.datasets[0].backgroundColor,
                    transactionCounts:
                      categoryData.expense.datasets[0].transactionCounts,
                  },
                ],
              }}
              options={chartOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;
