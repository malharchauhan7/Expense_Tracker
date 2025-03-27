import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import AddCategory from "./AddCategory";
const AddExpense = ({ isOpen, onClose }) => {
  const [categories, setcategories] = useState([]);
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      amount: "",
      category_id: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      transaction_type: "Expense",
    },
  });
  const transactionType = watch("transaction_type");
  const HandleGetAllCategoriesByUser = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await axios.get("/api/category/user/" + user_id);
      setcategories(resp.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCategories = categories.filter(
    (category) => category.category_type === transactionType
  );

  useEffect(() => {
    HandleGetAllCategoriesByUser();
  }, []);

  const onSubmit = async (data) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const TransactionData = {
        amount: parseFloat(data.amount),
        category_id: data.category_id,
        description: data.description,
        date: new Date(data.date).toISOString(),
        transaction_type: data.transaction_type,
        user_id: user_id,
        status: true,
      };

      const resp = await axios.post("/api/transactions", TransactionData);
      if (resp.status === 200) {
        toast.success("Transaction Added Successfully");
      }
      console.log(TransactionData);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed! or Add Category first");
    }
  };
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
  };
  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Toaster position="bottom-right" />

      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative m-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl font-bold text-gray-800"
              >
                Add Transaction
              </motion.h2>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Transaction Type */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setValue("transaction_type", "Expense")}
                  type="button"
                  className={`p-3 rounded-lg text-center transition-colors ${
                    transactionType === "Expense"
                      ? "bg-red-100 text-red-600 font-medium"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Expense
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => setValue("transaction_type", "Income")}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    transactionType === "Income"
                      ? "bg-green-100 text-green-600 font-medium"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Income
                </motion.button>
              </div>

              {/* Amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  {...register("amount", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                />
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  {...register("category_id", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {filteredCategories.length > 0 ? (
                    <>
                      {filteredCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">
                      No {transactionType} categories available
                    </option>
                  )}
                </select>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  {...register("description", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  required
                />
              </motion.div>

              {/* Date */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  {...register("date", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className={`w-full py-3 rounded-lg text-white font-medium ${
                  transactionType === "Expense"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Add {transactionType}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpense;
