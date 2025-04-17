import React, { useEffect, useState } from "react";
import { FaWallet, FaArrowUp, FaArrowDown, FaChartBar } from "react-icons/fa";
import AddExpense from "./AddExpense";
import BudgetAlert from "./BudgetAlert";
import MonthlyCharts from "../charts/user/MonthlyCharts";
import CategoryPieChart from "../charts/user/CategoryPieChart";
import FinancialSuggestions from "../charts/user/FinancialSuggestions";
import Chatbot from "../Chatbot";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";

const UserDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [Name, setName] = useState("");
  const [budgetAnalytics, setBudgetAnalytics] = useState([]);
  const [STATS, SET_STATS] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define a global refresh function that the chatbot can call
  useEffect(() => {
    window.refreshTransactions = () => {
      setRefresh((prev) => !prev);
      toast.success("Transaction added via chatbot!");
    };

    return () => {
      // Clean up the global function when component unmounts
      delete window.refreshTransactions;
    };
  }, []);

  useEffect(() => {
    HandleGetAllTransactions();
    HandleGetAnalytics();
    HandleGetName();
    fetchBudgetAnalytics();
    fetchSuggestions();
  }, [refresh]);

  const HandleGetName = () => {
    const name = localStorage.getItem("name");
    setName(name);
  };

  const fetchBudgetAnalytics = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const response = await axios.get(`/api/budgets/analytics/${userId}`);
      setBudgetAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch budget analytics:", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      const { data } = await axios.get(`/api/financial-suggestions/${userId}`);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const HandleGetAnalytics = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const { data } = await axios.get(
        `/api/analytics/transactions/user/${user_id}`
      );

      SET_STATS({
        balance: data.total_balance,
        income: data.total_income,
        expenses: data.total_expense,
        savings: data.total_savings,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const HandleGetAllTransactions = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await axios.get("/api/transactions/user/" + user_id);

      if (resp.status === 500) {
        toast.error("No Transactions Found");
        return;
      }

      const sortedData = resp.data.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setTransactions(sortedData);
    } catch (error) {
      console.error(error);
    }
  };

  const StatCard = ({ title, amount, icon, bgColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        <div className={`${bgColor} p-4 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">
            ${amount.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <Toaster position="bottom-right" />
      <AddExpense
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRefresh((prev) => !prev);
        }}
      />

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, <span className="text-blue-600">{Name} !</span>
        </h1>
        <p className="text-gray-600">
          Track your expenses and savings with ease
        </p>
      </div>

      {/* Stats Grid */}

      {/* Financial Suggestions */}
      {suggestions && (
        <div className="mb-8">
          <FinancialSuggestions suggestions={suggestions} />
        </div>
      )}

      {/* Budget Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {budgetAnalytics.length > 0 &&
          budgetAnalytics?.map((budget) => (
            <BudgetAlert key={budget.budget_id} budget={budget} />
          ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Recent Transactions
          </h2>
          <Link to="/user/transactions">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer">
              View All
            </button>
          </Link>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? (
            <>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        transaction.transaction_type === "Expense"
                          ? "bg-red-50"
                          : "bg-green-50"
                      }`}
                    >
                      {transaction.transaction_type === "Expense" ? (
                        <FaArrowDown className="text-red-600 text-lg" />
                      ) : (
                        <FaArrowUp className="text-green-600 text-lg" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category_id.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.transaction_type === "Expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.transaction_type === "Expense" ? "-" : "+"}$
                      {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Add New Transaction
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <FaWallet className="text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 text-center">
                No recent transactions to display
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                Add Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;
