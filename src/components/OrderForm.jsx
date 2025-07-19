import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import Navbar from "../pages/Navbar";
import { motion } from "framer-motion";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  received: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [itemCache, setItemCache] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("cloudAuth");
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await axios.get(
        `https://cloudkitchenbackend.fly.dev/api/orders/user${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ordersData = response.data.orders;

      // Fetch item details for each item
      for (const order of ordersData) {
        for (const item of order.OrderItems) {
          if (!itemCache[item.CatalogItemID]) {
            try {
              const itemResponse = await axios.get(
                `https://cloudkitchenbackend.fly.dev/api/getItem/${item.CatalogItemID}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setItemCache((prev) => ({
                ...prev,
                [item.CatalogItemID]: itemResponse.data,
              }));
            } catch (err) {
              console.error("Failed to fetch item:", err);
            }
          }
        }
      }

      setOrders(ordersData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-emerald-600">
          🍽️ My Orders
        </h1>
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {["all", "pending", "open", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                statusFilter === status
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <LoaderCircle className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found for this filter.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order ID: <span className="text-gray-600 text-sm">{order.ID}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.CreatedAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[order.Status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.Status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.OrderItems.map((item) => {
                    const itemDetails = itemCache[item.CatalogItemID];
                    return (
                      <div
                        key={item.ID}
                        className="flex items-center justify-between border rounded p-2 bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {itemDetails?.ImageURL ? (
                            <img
                              src={itemDetails.ImageURL}
                              alt={itemDetails.Name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {itemDetails?.Name || "Loading..."}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.Quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-emerald-600">
                          ₹{item.PriceAtOrder}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Delivery: {order.DeliveryAddress} ({order.Pincode})
                    {order.Phone ? ` | 📞 ${order.Phone}` : ""}
                  </p>
                  <p className="font-bold text-emerald-600">₹{order.Amount}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
