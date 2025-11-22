import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
const onProceedToPay = () => {
  // Example navigation to payment route:
  navigate('/payment');
};

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("cloudAuth");
      const cloudUser = JSON.parse(localStorage.getItem("cloudUser"));
      if (!token || !cloudUser?.email) {
        toast.error("You are not logged in!");
        navigate("/login");
        return;
      }
      const response = await axios.get(`https://cloudkitchenbackend-production.up.railway.app/api/cart/items?email=${cloudUser.email}`, { headers: { Authorization: `Bearer ${token}` } });
      const cartData = response.data;
      const detailedCartItems = await Promise.all(cartData.map(async (item) => {
        try {
          const detailResponse = await axios.get(`https://cloudkitchenbackend-production.up.railway.app/api/getItem/${item.ItemID}`, { headers: { Authorization: `Bearer ${token}` } });
          return { ...item, CatalogItem: detailResponse.data };
        } catch {
          return { ...item, CatalogItem: null };
        }
      }));
      setCartItems(detailedCartItems);
    } catch {
      toast.error("Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const updateCartQuantity = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem("cloudAuth");
      if (!token) {
        toast.error("You are not logged in!");
        navigate("/login");
        return;
      }
      await axios.post("https://cloudkitchenbackend-production.up.railway.app/api/cart/update", { itemId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
      fetchCartItems();
      toast.success("Cart updated");
    } catch {
      toast.error("Failed to update cart");
    }
  };

  useEffect(() => { fetchCartItems(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-50">
        <Navbar />
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-emerald-500 mt-4"></div>
        <p className="mt-4 text-emerald-600 font-medium animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-center mt-10"
      >
        <div className="text-6xl animate-bounce">🛒</div>
        <p className="text-2xl mt-4 text-gray-700 font-semibold">Your cart is empty</p>
        <p className="text-sm text-gray-500 mt-1">Add delicious items to your cart to begin your order.</p>
        <button 
          onClick={() => navigate("/home")}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full transition-transform transform hover:scale-105"
        >
          Continue Browsing
        </button>
      </motion.div>
    </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 py-20">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6 text-center">🛒 Your Cart</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <motion.div
            key={item.ID}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center bg-white rounded-2xl shadow-lg p-4 transition-transform"
          >
            <img
              src={item.CatalogItem?.ImageURL || "https://via.placeholder.com/100"}
              alt={item.CatalogItem?.Name || "No Name"}
              className="w-24 h-24 object-cover rounded-xl mr-4 shadow"
            />
            <div className="flex-grow">
              <h2 className="text-lg font-bold text-gray-800 mb-1">{item.CatalogItem?.Name || "Item Not Found"}</h2>
              <p className="text-sm text-gray-500 mb-1 line-clamp-2">{item.CatalogItem?.Description || "No description available."}</p>
              <span className="text-emerald-600 font-semibold">₹{item.CatalogItem?.Price || "--"}</span>
            </div>
            <div className="flex flex-col items-center space-y-2 ml-4">
              <button onClick={() => updateCartQuantity(item.ItemID, item.Quantity + 1)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">+</button>
              <span className="font-semibold text-gray-700">{item.Quantity}</span>
              <button onClick={() => item.Quantity > 1 ? updateCartQuantity(item.ItemID, item.Quantity - 1) : updateCartQuantity(item.ItemID, 0)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">-</button>
              <button onClick={() => updateCartQuantity(item.ItemID, 0)} className="text-red-500 hover:text-red-600 text-xs underline">Remove</button>
            </div>
          </motion.div>
        ))}
      </div>
      {cartItems.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onProceedToPay}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full shadow transition-transform active:scale-95"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default CartPage;