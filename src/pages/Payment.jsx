import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { MapPin, Edit, Trash2, Plus, CheckCircle } from "lucide-react";
import Navbar from "./Navbar";
import UpiQr from "../components/UpiQr";

const PaymentPage = () => {
  const [user, setUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    Name: "",
    City: "",
    State: "",
    Pincode: "",
    Phone: "",
  });
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [utr, setUtr] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [userUpiId, setUserUpiId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const DEFAULT_PIC =
    "https://imgs.search.brave.com/Z0EEymsLVCCMKvWpyP6Vc3cjb_v0Zy3vu42RTP-FfCc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNy8w/Ni8xMy8xMi81NC9w/cm9maWxlLTIzOTg3/ODNfNjQwLnBuZw";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("cloudAuth");
        const res = await axios.get(
          "https://cloudkitchenbackend.fly.dev/api/getUser",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
      } catch {
        toast.error("Failed to load user data");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("cloudAuth");
        const cloudUser = JSON.parse(localStorage.getItem("cloudUser"));
        if (!token || !cloudUser?.email) {
          toast.error("You are not logged in!");
          return;
        }
        const response = await axios.get(
          `https://cloudkitchenbackend.fly.dev/api/cart/items?email=${cloudUser.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cartData = response.data;
        const detailedCartItems = await Promise.all(
          cartData.map(async (item) => {
            try {
              const detailResponse = await axios.get(
                `https://cloudkitchenbackend.fly.dev/api/getItem/${item.ItemID}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { ...item, CatalogItem: detailResponse.data };
            } catch {
              return { ...item, CatalogItem: null };
            }
          })
        );
        setCartItems(detailedCartItems);
      } catch {
        toast.error("Failed to fetch cart items");
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.CatalogItem?.Price || 0;
      return total + price * item.Quantity;
    }, 0);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("cloudAuth");
    const res = await axios.get(
      "https://cloudkitchenbackend.fly.dev/api/getUser",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUser(res.data);
  };

  const validateAddressForm = () => {
    const { Name, City, State, Pincode, Phone } = addressForm;
    if (!Name || !City || !State || !Pincode || !Phone) {
      toast.error("All address fields are required.");
      return false;
    }
    if (!/^\d{10}$/.test(Phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }
    return true;
  };

  const handleAddOrUpdateAddress = async () => {
    if (!validateAddressForm()) return;
    try {
      const token = localStorage.getItem("cloudAuth");
      setLoadingOtp(true); // show loader

      await axios.post(
        "https://cloudkitchenbackend.fly.dev/api/address/send-otp",
        { email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("OTP sent to your email. Please verify.");
      setIsVerifyingOtp(true);
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setLoadingOtp(false); // hide loader
    }
  };

  const handleVerifyOtpAndSave = async () => {
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.post(
        "https://cloudkitchenbackend.fly.dev/api/address/verify-otp",
        {
          email: user.email, // or addressForm.Email if you add
          otp: otp.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // After OTP verification, proceed to save the address
      if (addingAddress) {
        await axios.post(
          "https://cloudkitchenbackend.fly.dev/api/addUser",
          {
            name: addressForm.Name,
            city: addressForm.City,
            state: addressForm.State,
            pincode: addressForm.Pincode,
            phone: addressForm.Phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Address added!");
      } else if (editingAddress) {
        await axios.put(
          `https://cloudkitchenbackend.fly.dev/api/address/${editingAddress.ID}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Address updated!");
      }

      await refreshUser();
      closeModal();
      setIsVerifyingOtp(false);
      setOtp("");
    } catch (err) {
      toast.error("Invalid OTP, please try again.");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.delete(
        `https://cloudkitchenbackend.fly.dev/api/address/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Address deleted!");
      if (selectedAddressId === id) setSelectedAddressId(null);
      await refreshUser();
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      Name: address.Name,
      City: address.City,
      State: address.State,
      Pincode: address.Pincode,
      Phone: address.Phone || "",
    });
  };

  const closeModal = () => {
    setAddingAddress(false);
    setEditingAddress(null);
    setAddressForm({ Name: "", City: "", State: "", Pincode: "", Phone: "" });
  };

  const handleCheckout = () => {
    if (!selectedAddressId) {
      toast.error("Please select an address before checkout.");
      return;
    }
    const selectedAddress = user.addresses.find(
      (a) => a.ID === selectedAddressId
    );
    toast.success(
      `Proceeding with checkout for:\n${selectedAddress.Name}, ${selectedAddress.City}`
    );
    setShowQr(true);
  };

  if (!user || loadingCart) return <div className="p-10">Loading...</div>;

  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6 text-emerald-600">
          🧾 Payment Details
        </h1>
        <div className="bg-white p-6 rounded-xl shadow space-y-8">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <img
              src={user.picture || DEFAULT_PIC}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500 text-sm">Role: {user.role}</p>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Delivery Address</h3>
              <button
                onClick={() => setAddingAddress(true)}
                className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>
            <div className="space-y-4">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((address) => (
                  <div
                    key={address.ID}
                    className={`p-4 border rounded-lg flex items-start justify-between cursor-pointer ${
                      selectedAddressId === address.ID
                        ? "bg-emerald-50 border-emerald-400"
                        : "bg-gray-50"
                    }`}
                    onClick={() => setSelectedAddressId(address.ID)}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="text-emerald-600 mt-1" />
                      <div>
                        <p className="font-semibold">{address.Name}</p>
                        <p className="text-sm text-gray-600">
                          {address.City}, {address.State} - {address.Pincode}
                        </p>
                        <p className="text-sm text-gray-600">
                          📞 {address.Phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {selectedAddressId === address.ID && (
                        <CheckCircle className="text-emerald-600 w-5 h-5 mt-1" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditAddress(address);
                        }}
                        className="p-2 rounded hover:bg-emerald-50"
                      >
                        <Edit className="w-5 h-5 text-emerald-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.ID);
                        }}
                        className="p-2 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No addresses saved yet.</p>
              )}
            </div>
          </div>

          {/* Invoice Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">🧾 Invoice Summary</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.ID}
                  className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      {item.CatalogItem?.Name || "Item not found"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.Quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-600">
                    ₹{item.CatalogItem?.Price * item.Quantity || "--"}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 border-t pt-3 font-semibold text-lg">
                <span>Total</span>
                <span className="text-emerald-600">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            disabled={!selectedAddressId}
            onClick={handleCheckout}
            className={`w-full py-3 rounded-lg text-white text-lg font-medium ${
              selectedAddressId
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Proceed with Checkout
          </button>

          {/* QR & UTR */}
          {showQr && (
            <div className="mt-6 space-y-4">
              <UpiQr
                upiId="7979012363@upi"
                payeeName="Utkarsh"
                amount={calculateTotal()}
              />
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">UPI ID:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("7979012363@upi");
                      toast.success("UPI ID copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-emerald-700 px-3 py-1 text-sm font-medium transition"
                  >
                    7979012363@upi
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16h8M8 12h8m-8-4h8"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-center space-y-4">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2 text-gray-800">
                    📸 Upload Payment Screenshot
                  </h3>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) {
                        toast.error("Please select an image file.");
                        return;
                      }
                      setSelectedFile(file);
                      toast.success("Screenshot selected, ready to upload.");
                    }}
                    className="block w-full text-sm text-gray-700 border border-dashed border-emerald-300 rounded-lg cursor-pointer bg-emerald-50 hover:bg-emerald-100 focus:outline-none p-3 transition"
                  />
                  <button
                    
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("cloudAuth");
                        const cloudUser = JSON.parse(
                          localStorage.getItem("cloudUser")
                        );
                        if (!token || !cloudUser?.email) {
                          toast.error("Not logged in!");
                          return;
                        }

                        const orderItems = cartItems.map((item) => ({
                          item_id: item.ItemID,
                          quantity: item.Quantity,
                        }));

                        const selectedAddress = user.addresses.find(
                          (a) => a.ID === selectedAddressId
                        );

                        const orderResponse = await axios.post(
                          "https://cloudkitchenbackend.fly.dev/api/orders/create",
                          {
                            user_id: user.id,
                            user_email: user.email,
                            user_name: user.name,
                            amount: calculateTotal(),
                            address_id: selectedAddressId,
                            address: selectedAddress,
                            items: orderItems,
                           
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        
                        const orderId = orderResponse.data.order.ID;
                        setCreatedOrderId(orderId);
                        
                        
                        
                        if (!selectedFile) {
                          toast.error("Please select a screenshot first.");
                          return;
                        }
                       
                        setUploadingScreenshot(true);

                        const formData = new FormData();
                        formData.append("payment_screenshot", selectedFile);
                        
                        await axios.post(
                          `https://cloudkitchenbackend.fly.dev/api/orders/${orderId}/upload-payment-screenshot`,
                          formData,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "multipart/form-data",
                            },
                          }
                        );

                        toast.success("Payment screenshot uploaded! Clearing cart...");
                    
                        await axios.delete(
                            `https://cloudkitchenbackend.fly.dev/api/cart/items?email=${encodeURIComponent(cloudUser.email)}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                    
                        toast.success("Cart cleared successfully! Redirecting...");
                        setTimeout(() => {
                          window.location.href = "/orders";
                        }, 1500);
                      } catch (error) {
                        console.error(error);
                        toast.error("Failed to upload payment screenshot.");
                      } finally {
                        setUploadingScreenshot(false);
                      }
                    }}
                    className={`mt-4 w-full py-3 rounded-lg text-white text-lg font-medium transition ${
                      !selectedFile 
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    {uploadingScreenshot
                      ? "Uploading..."
                      : "Submit Payment Screenshot"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {addingAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <input
                type="text"
                placeholder="Name"
                value={addressForm.Name}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, Name: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="City"
                value={addressForm.City}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, City: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="State"
                value={addressForm.State}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, State: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={addressForm.Pincode}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, Pincode: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={addressForm.Phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, Phone: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateAddress}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {isVerifyingOtp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
              <h3 className="text-lg font-semibold">Enter OTP to verify</h3>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded p-2"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => {
                    setIsVerifyingOtp(false);
                    setOtp("");
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtpAndSave}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Verify & Save
                </button>
              </div>
            </div>
          </div>
        )}
        {loadingOtp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-full p-4 flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-emerald-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentPage;
