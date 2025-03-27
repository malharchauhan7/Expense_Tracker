import { FaTimes, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const AddCategory = ({ isOpen, onClose }) => {
  const [categories, setcategories] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      category_type: "Expense",
      status: true,
    },
  });
  // console.log(categories);
  useEffect(() => {
    HandleGetAllCategoriesByUser();
  }, [refresh]);
  const HandleGetAllCategoriesByUser = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const resp = await axios.get("/api/category/user/" + user_id);
      // console.log(resp.data);
      setcategories(resp.data);
    } catch (error) {
      console.error(error);
    }
  };
  const HandleDeleteCategories = async (id) => {
    try {
      const resp = await axios.delete(`/api/category/${id}`);
      // console.log(resp.data);
      if (resp.status == 200) {
        toast.success(resp.data.message);
      } else {
        toast.error("Can not delete category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Can not delete category");
    }
  };

  const onSubmit = async (data) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const payload = {
        name: data.name,
        category_type: data.category_type,
        user_id,
        status: true,
      };

      const resp = await axios.post("/api/category", payload);
      if (resp.status === 200) {
        toast.success("Category Added Successfully");
      }
      console.log(payload);
      reset();
      onClose();
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
      toast.error("Failed to Add Category");
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
                Add Category
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
            <h1 className="block text-sm font-medium text-gray-700 mb-2">
              Your Categories
            </h1>
            <div className="flex flex-col gap-1 text-lg mb-2 bg-gray-100/50 rounded-md">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex gap-2 items-center justify-between py-1 px-2"
                >
                  <div className="flex items-center gap-2">
                    <h1 className="select-none">{cat.name}</h1>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        cat.category_type === "Expense"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {cat.category_type}
                    </span>
                  </div>
                  <FaTrash
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    size={14}
                    onClick={() => HandleDeleteCategories(cat._id)}
                  />
                </div>
              ))}
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </motion.div>

              {/* Category Type - New Addition */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type
                </label>
                <select
                  {...register("category_type", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="w-full py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700"
              >
                Add Category
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCategory;
