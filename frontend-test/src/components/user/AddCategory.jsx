import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const AddCategory = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      status: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const payload = {
        name: data.name,
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
