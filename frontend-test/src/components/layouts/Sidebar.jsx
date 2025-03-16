import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt,
  FaCog,
  FaBars,
  FaSignOutAlt,
  FaUser,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentPath = location.pathname;
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("user_id");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const currentPath = location.pathname;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentPath.includes("/admin") && !isAdmin) {
      navigate("/user/dashboard");
      toast.error("Unauthorized access");
    }
  }, [location.pathname, navigate]);
  // Framer Motion
  const sidebarVariants = {
    open: {
      width: isMobile ? "100%" : "16rem",
      height: isMobile ? "5rem" : "100vh",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.3,
      },
    },
    closed: {
      width: isMobile ? "100%" : "4rem",
      height: isMobile ? "5rem" : "100vh",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.3,
      },
    },
  };

  const textVariants = {
    open: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3,
        delay: 0.1,
      },
    },
    closed: {
      opacity: 0,
      x: -10,
      transitionEnd: { display: "none" },
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.2,
      },
    },
  };
  const menuItemVariants = {
    hover: {
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
    closed: {
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
  };

  const adminMenuItems = [
    { icon: <FaUser />, text: "Profile", path: "profile" },

    {
      icon: <FaTachometerAlt />,
      text: "Dashboard",
      path: "dashboard",
    },
    { icon: <FaUsers />, text: "Manage Users", path: "users" },
    { icon: <FaCog />, text: "Settings", path: "settings" },
  ];

  const userMenuItems = [
    { icon: <FaUser />, text: "Profile", path: "profile" },
    { icon: <FaTachometerAlt />, text: "Dashboard", path: "dashboard" },
    { icon: <GrTransaction />, text: "Transactions", path: "transactions" },
    { icon: <FaCog />, text: "Settings", path: "settings" },
  ];

  const getMenuItems = () => {
    if (currentPath.includes("/admin")) {
      return adminMenuItems;
    }
    return userMenuItems;
  };
  const HandleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    localStorage.removeItem("isAdmin");
    setTimeout(() => {
      toast.success("Logout Successfully");
      navigate("/login");
    }, 1500);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className={`fixed ${
          isMobile ? "bottom-0 left-0 right-0" : "top-0 left-0 h-screen"
        } bg-white z-50 flex ${
          isMobile ? "flex-row justify-around items-center" : "flex-col"
        } shadow-lg`}
      >
        {!isMobile && (
          <div className="flex items-center p-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black text-xl hover:bg-blue-700 hover:text-white p-2 rounded-lg mr-2 cursor-pointer"
              aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <FaBars />
            </button>
          </div>
        )}

        <nav className={`${isMobile ? "flex-1" : "mt-4 flex-1"}`}>
          <ul className={`${isMobile ? "flex justify-around" : "space-y-1"}`}>
            {getMenuItems().map((item, index) => (
              <motion.li
                key={index}
                initial={false}
                variants={menuItemVariants}
                whileHover="hover"
                whileTap="tap"
                className={isMobile ? "flex-1" : ""}
              >
                <Link
                  to={item.path}
                  className={`flex ${
                    isMobile
                      ? "flex-col items-center justify-center"
                      : "items-center"
                  } p-3 rounded-lg mx-2 cursor-pointer
            ${
              location.pathname.includes(item.path)
                ? "bg-blue-700 text-white"
                : "hover:bg-blue-700 hover:text-white"
            }`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <motion.div
                    className="min-w-[24px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.icon}
                  </motion.div>
                  {(!isMobile || isOpen) && (
                    <motion.span
                      variants={textVariants}
                      animate={isOpen ? "open" : "closed"}
                      className={`${
                        isMobile ? "text-xs mt-1" : "ml-3"
                      } whitespace-nowrap`}
                    >
                      {item.text}
                    </motion.span>
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        {!isMobile && (
          <div className="flex items-center justify-center py-4 border-b border-gray-100">
            <motion.div
              className={`flex items-center space-x-3 ${
                !isOpen && "justify-center"
              }`}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-shrink-0 ml-2">
                <FaWallet className="w-8 h-8 text-blue-600" />
              </div>
              <Link to={"/"}>
                <div
                  className={`flex flex-col transition-all duration-300 ${
                    isOpen
                      ? "opacity-100 w-auto "
                      : "opacity-0 w-0 overflow-hidden "
                  }`}
                >
                  <span className="text-xl font-bold text-gray-800">
                    Expense
                  </span>
                  <span className="text-md font-medium text-blue-600">
                    Mate
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        )}
        <div className="p-3">
          <motion.button
            whileHover={{
              backgroundColor: "#EF4444",
              color: "white",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-3 rounded-lg w-full cursor-pointer"
            aria-label="Logout"
            onClick={() => {
              isMobile && setIsOpen(false), HandleLogout();
            }}
          >
            <div className="min-w-[24px] flex items-center justify-center">
              <FaSignOutAlt />
            </div>
            <span
              className={`
                ml-3 whitespace-nowrap
                
                ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}
              `}
            >
              Logout
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div
        className={`
             min-h-screen
    ${isMobile ? "pb-20" : "pt-16 " + (isOpen ? "ml-64" : "ml-16")}
    transition-all duration-300 ease-in-out
    bg-gray-50
        `}
      >
        {/* Show Navbar only on desktop */}
        {!isMobile && <Navbar />}

        {/* Dashboard content */}
        <div className={`p-4 ${isMobile ? "mt-10" : ""}`}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
