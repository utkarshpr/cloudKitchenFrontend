import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("cloudAuth");
      console.log(token)
      if (!token) {
        toast.error("You are not logged in!");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "https://cloudkitchenbackend.fly.dev/api/getCatalog",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCatalog(response.data.filter((item) => item.IsActive));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-emerald-700">
        Explore Our Delicious Menu
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {catalog.map((item) => (
    <motion.div
      key={item.ID}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {item.ImageURL ? (
        <motion.img
          src={item.ImageURL}
          alt={item.Name}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-50 text-gray-300 text-sm">
          No Image
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
          {item.Name}
        </h2>
        <p className="text-sm text-gray-500 flex-grow line-clamp-2">
          {item.Description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-emerald-600">
            ₹{item.Price}
          </span>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  ))}
</div>

    </div>
  );
};

export default HomePage;
