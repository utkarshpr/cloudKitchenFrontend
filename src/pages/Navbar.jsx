import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.loading("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("cloudAuth");
      localStorage.removeItem("cloudUser");
      toast.dismiss();
      toast.success("Logged out");
      navigate("/");
    }, 800);
  };

  const links = [
    { name: "Menu", href: "/home" },
    { name: "Orders", href: "/orders" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/home"
            className="text-2xl font-extrabold text-[#FC8019] tracking-tight"
          >
            Cloud Kitchen
          </Link>
        </motion.div>

        <div className="hidden md:flex space-x-6 items-center">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="relative text-gray-800 dark:text-gray-200 font-medium hover:text-[#FC8019] transition-colors"
            >
              <span className="hover-underline">{link.name}</span>
            </Link>
          ))}

          <Link
            to="/cart"
            className="flex items-center space-x-1 text-gray-800 dark:text-gray-200 hover:text-[#FC8019] transition-colors"
          >
            <ShoppingCart size={22} />
            <span>Cart</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-800 dark:text-gray-200"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="md:hidden bg-white dark:bg-gray-900 backdrop-blur-md px-6 pt-4 pb-6 space-y-4 shadow-xl rounded-b-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-800 dark:text-gray-200 text-lg font-medium hover:text-[#FC8019] transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-1 text-gray-800 dark:text-gray-200 text-lg hover:text-[#FC8019] transition-colors"
            >
              <ShoppingCart size={22} />
              <span>Cart</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors text-lg"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .hover-underline {
          position: relative;
          display: inline-block;
          cursor: pointer;
        }
        .hover-underline::after {
          content: "";
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #fc8019;
          transform-origin: bottom right;
          transition: transform 0.3s ease-out;
        }
        .hover-underline:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
