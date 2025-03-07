import { useState, useEffect } from "react";
import { FaSearch, FaBell, FaTimes, FaRegUserCircle } from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [username, setusername] = useState("");

  const HandleShowUsername = () => {
    const name = localStorage.getItem("name");
    setusername(name);
  };

  useEffect(() => {
    HandleShowUsername();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={{
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 1)",
        backdropFilter: isScrolled ? "blur(8px)" : "blur(0px)",
      }}
      transition={{ duration: 0.3 }}
      className="w-full h-16 fixed top-0 right-0 z-40 md:pl-16"
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-white z-50 md:hidden"
            >
              <div className="flex items-center h-16 px-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative items-center">
          <motion.div whileFocus={{ scale: 1.02 }} className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 transition-all duration-300"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </motion.div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <FaSearch className="text-gray-600 text-xl" />
          </motion.button>
          <Link to={"profile"}>
            <div className="p-2 flex items-center justify-center gap-4 select-none">
              {username && <p className="font-semibold ">{username}</p>}
              <FaRegUserCircle className="text-gray-800 text-xl" />
            </div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <FaBell className="text-gray-600 text-xl" />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
