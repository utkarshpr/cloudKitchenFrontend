// Enhanced HomePage with quantity + - cart functionality for logged-in users

import React, { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Search, Filter, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

const HomePage = () => {
  const [catalog, setCatalog] = useState([]);
  const [filteredCatalog, setFilteredCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [cartLoading, setCartLoading] = useState(true);


  const navigate = useNavigate();

// inside HomePage component
useEffect(() => {
  const init = async () => {
    await fetchCatalog();
    await fetchCartItems();
  };
  init();
}, []);



const fetchCatalog = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("cloudAuth");
    if (!token) {
      toast.error("You are not logged in!");
      navigate("/login");
      return;
    }

    const cloudUser = JSON.parse(localStorage.getItem("cloudUser"));

    // optional: clear cart on load (if intended)
    await axios.delete(
      `https://cloudkitchenbackend-production.up.railway.app/api/cart/items?email=${encodeURIComponent(cloudUser.email)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const response = await axios.get(
      "https://cloudkitchenbackend-production.up.railway.app/api/getCatalog",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Normalize keys so UI uses consistent fields
    const normalized = response.data.map((item) => ({
      ID: item.ID || item.id || item.Id,
      Name: item.Name || item.name,
      Description: item.Description || item.description,
      Price: item.Price || item.price,
      ImageURL: item.ImageURL || item.image_url || item.imageUrl || "", // <-- important
      IsActive: item.IsActive !== undefined ? item.IsActive : item.is_active,
      CreatedAt: item.CreatedAt || item.createdAt || item.created_at,
      Category: (item.Category || item.category || "other").toString(),
      Type: item.Type || item.type || "Main",
    }));

    const activeItems = normalized.filter((it) => it.IsActive);
    setCatalog(activeItems);
    setFilteredCatalog(activeItems);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch catalog");
  } finally {
    setLoading(false);
  }
};



  const handleSearchAndFilter = () => {
    let result = [...catalog];
    if (categoryFilter !== "all") {
      result = result.filter(
        (item) => item.Category.toLowerCase() === categoryFilter
      );
    }
    if (searchTerm.trim()) {
      const fuse = new Fuse(result, { keys: ["Name"], threshold: 0.4 });
      result = fuse.search(searchTerm).map((r) => r.item);
    }
    setFilteredCatalog(result);
  };


  useEffect(() => {
    handleSearchAndFilter();
  }, [searchTerm, categoryFilter, catalog]);

  const typesGrouped = filteredCatalog.reduce((acc, item) => {
    acc[item.Type] = acc[item.Type] || [];
    acc[item.Type].push(item);
    return acc;
  }, {});

  const categoryTypes = Object.keys(typesGrouped);
  const cloudUser = JSON.parse(localStorage.getItem("cloudUser"));
  const userEmail = cloudUser?.email;

  const fetchCartItems = async () => {
    try {
        setCartLoading(true);
        const token = localStorage.getItem("cloudAuth");
        if (!token || !userEmail) {
            toast.error("You are not logged in!");
            navigate("/login");
            return;
        }
        const response = await axios.get(
            `https://cloudkitchenbackend-production.up.railway.app/api/cart/items?email=${encodeURIComponent(userEmail)}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const cartMap = {};
        response.data.forEach(item => {
            cartMap[item.ItemID] = item.Quantity; // CASE SENSITIVE
        });
        setCartItems(cartMap);
    } catch (error) {
        console.error(error);
        toast.error("Failed to fetch cart items");
    } finally {
        setCartLoading(false);
    }
};

// useEffect(() => {
//     fetchCatalog();
//     fetchCartItems();
// }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-500"></div>
      </div>
    );
  }

 
  const handleQuantityChange = async (itemId, delta) => {
    try {
        const token = localStorage.getItem("cloudAuth");
        if (!token || !userEmail) {
            toast.error("You are not logged in!");
            navigate("/login");
            return;
        }

        const currentQty = cartItems[itemId] || 0;
        const newQuantity = currentQty + delta;
        if (newQuantity < 0) return;

        await axios.post(
            "https://cloudkitchenbackend-production.up.railway.app/api/cart/update",
            { itemId, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setCartItems(prev => {
            const updated = { ...prev };
            if (newQuantity === 0) {
                delete updated[itemId];
            } else {
                updated[itemId] = newQuantity;
            }
            return updated;
        });

       
        if (delta > 0) {
          toast.success('✅ Added to cart');
        } else if (newQuantity === 0) {
          toast('❌ Removed from cart', { icon: '🗑️' });
        } else {
          toast.success('🛒 Quantity updated');
        }
        
    } catch (error) {
        console.error(error);
        toast.error("Failed to update cart");
    }
};


  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-center text-4xl md:text-5xl font-extrabold text-emerald-600 mb-6 md:mb-10">
        🍽️ Explore Our Delicious Menu
      </h1>
      
      <button
  onClick={() => setShowCategorySheet(true)}
  title="Menu"
  className="fixed bottom-5 right-5 z-30 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg transition"
>
  <Menu size={24} />
</button>

{showCategorySheet && (
  <div
    className="fixed inset-0 bg-black/50 z-40 flex justify-center items-end"
    onClick={() => setShowCategorySheet(false)}
  >
    <div
      className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

      <h2 className="text-xl font-bold mb-4 text-center text-emerald-600">
        📜 Browse Menu Sections
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {categoryTypes.map((type) => (
          <button
            key={type}
            onClick={() => {
              document.getElementById(type)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              setShowCategorySheet(false);
            }}
            className="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium shadow-sm transition"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
      <div className="relative w-full sm:w-1/2">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={20} />
  <input
    type="text"
    placeholder="🔍 Search dishes..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 pr-4 py-2 w-full bg-white/80 backdrop-blur border border-emerald-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition text-emerald-800 placeholder-emerald-400"
  />
</div>

        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-white/80 backdrop-blur border border-emerald-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition text-emerald-800"
          >
            <option value="all">🌿 All Categories</option>
            <option value="veg">🥗 Veg</option>
            <option value="non-veg">🍗 Non-Veg</option>
          </select>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      {Object.entries(typesGrouped).map(([type, items]) => (
        <div key={type} id={type} className="mb-10 scroll-mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-500 mb-4 capitalize">
            {type}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <motion.div
                key={item.ID}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden cursor-pointer flex flex-col"
              >
                {item.ImageURL ? (
                  <img
                    src={item.ImageURL}
                    alt={item.Name}
                    className="w-full h-40 md:h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 md:h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow relative">
                  <span
                    className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                      item.Category.toLowerCase() === "veg"
                        ? "bg-[#3AB757]"
                        : "bg-[#E43B4F]"
                    }`}
                  ></span>
                  <h3 className="text-md font-semibold text-gray-800 truncate mb-1">
                    {item.Name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {item.Description}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-emerald-600 font-bold text-sm md:text-base">
                      ₹{item.Price}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.ID, -1)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span>{cartLoading ? "..." : (cartItems[item.ID] || 0)}</span>
                      <button
                        onClick={() => handleQuantityChange(item.ID, 1)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
