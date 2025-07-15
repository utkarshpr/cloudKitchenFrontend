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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {catalog.map((item) => (
          <motion.div
            key={item.ID}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between border border-gray-200"
          >
            {item.ImageURL ? (
              <img
                src={item.ImageURL}
                alt={item.Name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                No Image Available
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold text-gray-800">
                {item.Name}
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex-grow">
                {item.Description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-600">
                  ₹{item.Price}
                </span>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors">
                  <ShoppingCart size={20} />
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
