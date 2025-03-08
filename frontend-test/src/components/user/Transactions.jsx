import React, { useEffect, useState } from "react";
import {
  FaFilter,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import AddExpense from "./AddExpense";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import AddCategory from "./AddCategory";
import { format } from "date-fns";

const Transactions = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // GET ALL TRANSACTIONS BY USER_ID
  const HandleGetAllTransactions = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await axios.get("/api/transactions/user/" + user_id);

      // console.log(resp.data);
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
  // Delete  TRANSACTIONS BY USER_ID
  const HandleDeleteTransactionbyId = async (id) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      toast.success("Transaction deleted successfully");
      HandleGetAllTransactions();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  };

  useEffect(() => {
    HandleGetAllTransactions();
  }, [refresh]);

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
      <AddCategory
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setRefresh((prev) => !prev);
        }}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Transactions
        </h1>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="px-4 py-2 flex items-center space-x-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <FaFilter className="text-gray-400" />
            <span>Filter</span>
          </button>

          {/* Add Category */}
          <button
            className="px-4 py-2 flex items-center space-x-2 text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg  cursor-pointer"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <FaPlus className="text-blue-400" />
            <span>Add Category</span>
          </button>

          {/* Add Transaction */}
          <button
            className="px-4 py-2 flex items-center space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="form-select rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <select className="form-select rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="salary">Salary</option>
            </select>

            <input
              type="date"
              className="form-input rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />

            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {transactions.length > 0 ? (
            <>
              {transactions?.map((transaction) => (
                <div
                  key={transaction._id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.transaction_type === "Expense"
                            ? "bg-red-50"
                            : "bg-green-50"
                        }`}
                      >
                        {transaction.transaction_type === "Expense" ? (
                          <FaArrowDown className="text-red-600" />
                        ) : (
                          <FaArrowUp className="text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.category_id.name || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.transaction_type === "Expense"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.transaction_type === "Expense"
                            ? "-"
                            : "+"}
                          ${transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this transaction?"
                            )
                          ) {
                            HandleDeleteTransactionbyId(transaction._id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default Transactions;
