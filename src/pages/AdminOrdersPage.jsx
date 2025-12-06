// pages/AdminOrdersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import Navbar from "./Navbar";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  received: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("cloudAuth");
          if (!token) {
            toast.error("You are not logged in!");
            navigate("/login");
            return;
          }
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await axios.get(
        `https://cloudkitchenbackend-production.up.railway.app/api/orders/user${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
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

  const handleUpdateStatus = async (orderId, field, value) => {
    try {
      setUpdatingId(orderId);
      const token = localStorage.getItem("cloudAuth");

      const body =
        field === "status"
          ? { status: value }
          : { payment_status: value };

      const res = await axios.put(
        `https://cloudkitchenbackend-production.up.railway.app/api/orders/${orderId}/status`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.order;

      setOrders((prev) =>
        prev.map((o) => (o.ID === updated.ID ? updated : o))
      );
      toast.success("Order updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-emerald-700">
          🧾 Admin – Orders
        </h1>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "pending", "open", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-emerald-500 text-white border-emerald-500 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status === "all"
                ? "All"
                : status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <LoaderCircle className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.ID}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Order ID: <span className="text-gray-500">{order.ID}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(order.CreatedAt)}
                    </p>
                    {/* user info */}
                    {order.User && (
                      <p className="text-xs text-gray-500 mt-1">
                        👤 {order.User.Name} · {order.User.Email}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      statusColors[order.Status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.Status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y">
                  {order.OrderItems.map((item) => (
                    <div key={item.ID} className="flex items-center gap-4 p-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.CatalogItemID}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.Quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600 text-sm">
                        ₹{item.PriceAtOrder}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer: address + controls */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 p-4 bg-gray-50 border-t">
                  <div className="text-sm text-gray-600">
                    <p>
                      {order.DeliveryAddress} ({order.Pincode})
                    </p>
                    {order.Phone && <p>📞 {order.Phone}</p>}
                    <p className="text-xs text-gray-400">
                      Payment: {order.PaymentStatus.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
                    <p className="font-bold text-emerald-700 text-lg">
                      ₹{order.Amount}
                    </p>

                    {/* Status select */}
                    <select
                      value={order.Status}
                      onChange={(e) =>
                        handleUpdateStatus(order.ID, "status", e.target.value)
                      }
                      disabled={updatingId === order.ID}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="received">received</option>
                      <option value="preparing">preparing</option>
                      <option value="out_for_delivery">out_for_delivery</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>

                    {/* Payment status select */}
                    <select
                      value={order.PaymentStatus}
                      onChange={(e) =>
                        handleUpdateStatus(
                          order.ID,
                          "payment_status",
                          e.target.value
                        )
                      }
                      disabled={updatingId === order.ID}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="failed">failed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrdersPage;
