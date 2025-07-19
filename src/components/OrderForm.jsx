import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { LoaderCircle, FileDown } from "lucide-react";
import Navbar from "../pages/Navbar";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import autoTable from "jspdf-autotable";

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
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

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
      const uniqueItemIds = new Set();
      ordersData.forEach(order =>
        order.OrderItems.forEach(item => {
          if (!itemCache[item.CatalogItemID]) {
            uniqueItemIds.add(item.CatalogItemID);
          }
        })
      );

      const fetchItemPromises = Array.from(uniqueItemIds).map(id =>
        axios
          .get(`https://cloudkitchenbackend.fly.dev/api/getItem/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(res => ({ id, data: res.data }))
          .catch(err => {
            console.error(`Failed to fetch item ${id}:`, err);
            return null;
          })
      );

      const fetchedItems = await Promise.all(fetchItemPromises);
      const newItems = {};
      fetchedItems.forEach(item => {
        if (item) {
          newItems[item.id] = item.data;
        }
      });

      setItemCache(prev => ({ ...prev, ...newItems }));
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

  const formatDate = dateString =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // const generateInvoice = async (order) => {
  //   try {
  //     setGeneratingInvoiceId(order.ID);
  //     const doc = new jsPDF();

  //     doc.setFontSize(18);
  //     doc.text("Cloud Kitchen Invoice", 14, 22);

  //     doc.setFontSize(12);
  //     doc.text(`Order ID: ${order.ID}`, 14, 32);
  //     doc.text(`Date: ${formatDate(order.CreatedAt)}`, 14, 40);
  //     doc.text(`Delivery: ${order.DeliveryAddress} (${order.Pincode})`, 14, 48);
  //     if (order.Phone) {
  //       doc.text(`Phone: ${order.Phone}`, 14, 56);
  //     }

  //     const tableRows = order.OrderItems.map(item => {
  //       const itemDetails = itemCache[item.CatalogItemID];
  //       return [
  //         itemDetails?.Name || "Loading...",
  //         item.Quantity,
  //         `₹${item.PriceAtOrder}`,
  //         `₹${item.Quantity * item.PriceAtOrder}`
  //       ];
  //     });

  //     autoTable(doc, {
  //       head: [["Item", "Qty", "Price", "Total"]],
  //       body: tableRows,
  //       startY: 65,
  //     });

  //     doc.text(`Total Amount: ₹${order.Amount}`, 14, doc.lastAutoTable.finalY + 10);

  //     doc.save(`invoice_${order.ID}.pdf`);
  //     toast.success("Invoice downloaded!");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to generate invoice.");
  //   } finally {
  //     setGeneratingInvoiceId(null);
  //   }
  // };

  const generateInvoice = async (order) => {
    try {
      setGeneratingInvoiceId(order.ID);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
  
      // Logo
      const logoUrl = "https://imgs.search.brave.com/gpMMeyt3UnXVwbO93JCJ5G5ppC0tzsuYd5vK1dVR-LA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly92b25k/eS1pbWFnZXMuY29t/L2ltYWdlLXByb3h5/P3c9NDAwJnVybD1o/dHRwczovL3Byb3Rv/aW5mcmFzdGFjay1t/eWZpcnN0YnVja2V0/Yjg4ODQ1MDEtZm5u/enZ4dDJlZTV2LnMz/LmFtYXpvbmF3cy5j/b20vSk9VRE1SeWNv/eHpWOWZvMlhnZTNo/UXVESVNpMXhib1JW/aDQ0LnBuZw";
      const logoWidth = 40;
      const logoHeight = 45;
      try {
        const logoImg = await loadImageAsBase64(logoUrl);
        doc.addImage(logoImg, "PNG", 150, 10, logoWidth, logoHeight);
      } catch (e) {
        console.warn("Logo could not be loaded, skipping.");
      }
  
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text("Cloud Kitchen Invoice", 14, 20);
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`Order ID: ${order.ID}`, 14, 30);
      doc.text(`Date: ${formatDate(order.CreatedAt)}`, 14, 36);
      doc.text(`Delivery: ${order.DeliveryAddress} (${order.Pincode})`, 14, 42);
      if (order.Phone) {
        doc.text(`Phone: ${order.Phone}`, 14, 48);
      }
  
      // Order & Payment Status with colored badge backgrounds
      const orderStatus = order.Status ? order.Status.replace(/_/g, " ").toUpperCase() : "N/A";
      const paymentStatus = order.PaymentStatus ? order.PaymentStatus.toUpperCase() : "N/A";
  
      const statusColorMap = {
        DELIVERED: [34, 197, 94],
        PENDING: [234, 179, 8],
        PREPARING: [234, 179, 8],
        OUT_FOR_DELIVERY: [234, 179, 8],
        RECEIVED: [59, 130, 246],
        CANCELLED: [239, 68, 68],
      };
  
      const paymentColorMap = {
        PAID: [34, 197, 94],
        PENDING: [234, 179, 8],
        COD: [59, 130, 246],
        FAILED: [239, 68, 68],
      };
  
      let yPosition = 54;
  
      // Draw Order Status Badge
      const orderColor = statusColorMap[orderStatus] || [107, 114, 128];
      const orderText = `Order Status: ${orderStatus}`;
      const orderTextWidth = doc.getTextWidth(orderText) + 6;
      doc.setFillColor(...orderColor);
      doc.roundedRect(14, yPosition - 5, orderTextWidth, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(orderText, 17, yPosition);
  
      yPosition += 10;
  
      // Draw Payment Status Badge
      const paymentColor = paymentColorMap[paymentStatus] || [107, 114, 128];
      const paymentText = `Payment Status: ${paymentStatus}`;
      const paymentTextWidth = doc.getTextWidth(paymentText) + 6;
      doc.setFillColor(...paymentColor);
      doc.roundedRect(14, yPosition - 5, paymentTextWidth, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(paymentText, 17, yPosition);
  
      // Reset text color for the table
      doc.setTextColor(0, 0, 0);
  
      // Table
      const tableRows = order.OrderItems.map(item => {
        const itemDetails = itemCache[item.CatalogItemID];
        return [
          itemDetails?.Name || "Loading...",
          item.Quantity.toString(),
          `Rs. ${item.PriceAtOrder.toLocaleString("en-IN")}`,
          `Rs. ${(item.Quantity * item.PriceAtOrder).toLocaleString("en-IN")}`,
        ];
      });
  
      autoTable(doc, {
        head: [["Item", "Qty", "Price", "Total"]],
        body: tableRows,
        startY: yPosition + 8,
        styles: { font: "helvetica", fontSize: 11 },
        headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
        },
      });
  
      // Total
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Total Amount: Rs.${order.Amount.toLocaleString("en-IN")}`,
        14,
        finalY
      );
  
      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(22, 163, 74);
      doc.text(
        "Thank you for ordering with Cloud Kitchen!",
        14,
        finalY + 20
      );
  
      doc.save(`invoice_${order.ID}.pdf`);
      toast.success("Invoice downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate invoice.");
    } finally {
      setGeneratingInvoiceId(null);
    }
  };
  
  
  
  // Helper to load image as Base64
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };
  
  return (
    <>
      <Navbar />
      <Toaster />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-emerald-700">📦 My Orders</h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["all", "pending", "open", "delivered", "cancelled"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full border transition text-sm font-medium ${
                statusFilter === status
                  ? "bg-emerald-500 text-white border-emerald-500 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status === "all"
                ? "All"
                : status.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center p-20">
            <LoaderCircle className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found for this filter.</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div
                key={order.ID}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Order ID: <span className="text-gray-500">{order.ID}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(order.CreatedAt)}</p>
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
                  {order.OrderItems.map(item => {
                    const itemDetails = itemCache[item.CatalogItemID];
                    return (
                      <div
                        key={item.ID}
                        className="flex items-center gap-4 p-4"
                      >
                        {itemDetails?.ImageURL ? (
                          <img
                            src={itemDetails.ImageURL}
                            alt={itemDetails.Name}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md animate-pulse" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{itemDetails?.Name || "Loading..."}</p>
                          <p className="text-xs text-gray-500">Qty: {item.Quantity}</p>
                        </div>
                        <p className="font-semibold text-emerald-600 text-sm">₹{item.PriceAtOrder}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 p-4 bg-gray-50 border-t">
                  <p className="text-sm text-gray-600">
                    {order.DeliveryAddress} ({order.Pincode}){" "}
                    {order.Phone && <span>📞 {order.Phone}</span>}
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-emerald-700 text-lg">₹{order.Amount}</p>
                    <button
                      onClick={() => generateInvoice(order)}
                      disabled={generatingInvoiceId === order.ID}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition ${
                        generatingInvoiceId === order.ID ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {generatingInvoiceId === order.ID ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          Invoice
                        </>
                      )}
                    </button>
                  </div>
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
