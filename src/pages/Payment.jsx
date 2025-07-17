import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import { toast } from "react-hot-toast";
import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import Navbar from "./Navbar";

const PaymentPage = () => {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPicture, setEditedPicture] = useState("");

  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    Name: "",
    City: "",
    State: "",
    Pincode: "",
    Phone: ""
  });
  const [addingAddress, setAddingAddress] = useState(false);

  const DEFAULT_PIC =
    "https://imgs.search.brave.com/Z0EEymsLVCCMKvWpyP6Vc3cjb_v0Zy3vu42RTP-FfCc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNy8w/Ni8xMy8xMi81NC9w/cm9maWxlLTIzOTg3/ODNfNjQwLnBuZw";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("cloudAuth");
        const res = await axios.get("https://cloudkitchenbackend.fly.dev/api/getUser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setEditedName(res.data.name);
        setEditedPicture(res.data.picture);
      } catch {
        toast.error("Failed to load user data");
      }
    };
    fetchUser();
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem("cloudAuth");
    const res = await axios.get("https://cloudkitchenbackend.fly.dev/api/getUser", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.put(
        "https://cloudkitchenbackend.fly.dev/api/user/update",
        { Name: editedName, Picture: editedPicture },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated!");
      await refreshUser();
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update profile");
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

  const validateAddressForm = () => {
    const { Name, City, State, Pincode, Phone } = addressForm;
    if (!Name || !City || !State || !Pincode || !Phone) {
      toast.error("All address fields are required.");
      return false;
    }
    return true;
  };

  const handleUpdateAddress = async () => {
    if (!validateAddressForm()) return;
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.put(
        `https://cloudkitchenbackend.fly.dev/api/address/${editingAddress.ID}`,
        addressForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Address updated!");
      await refreshUser();
      setEditingAddress(null);
    } catch {
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const token = localStorage.getItem("cloudAuth");
      await axios.delete(`https://cloudkitchenbackend.fly.dev/api/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address deleted!");
      await refreshUser();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleAddAddress = async () => {
    if (!validateAddressForm()) return;
    try {
      const token = localStorage.getItem("cloudAuth");
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
      await refreshUser();
      setAddingAddress(false);
      setAddressForm({ Name: "", City: "", State: "", Pincode: "", Phone: "" });
    } catch {
      toast.error("Failed to add address");
    }
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-emerald-600">🧾 Payment Details</h1>
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
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
            <button
              onClick={() => setShowEditModal(true)}
              className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          </div>

          {/* Address Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Your Saved Addresses</h3>
              <button
                onClick={() => {
                  setAddressForm({ Name: "", City: "", State: "", Pincode: "", Phone: "" });
                  setAddingAddress(true);
                }}
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
                    className="p-4 border rounded-lg flex items-start justify-between bg-gray-50"
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="text-emerald-600 mt-1" />
                      <div>
                        <p className="font-semibold">{address.Name}</p>
                        <p className="text-sm text-gray-600">
                          {address.City}, {address.State} - {address.Pincode}
                        </p>
                        <p className="text-sm text-gray-600">📞 {address.Phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditAddress(address)}
                        className="p-2 rounded hover:bg-emerald-50"
                      >
                        <Edit className="w-5 h-5 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.ID)}
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
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <Modal
            title="Edit Profile"
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
            fields={[
              {
                label: "Name",
                value: editedName,
                onChange: (e) => setEditedName(e.target.value),
              },
              {
                label: "Profile Picture URL",
                value: editedPicture,
                onChange: (e) => setEditedPicture(e.target.value),
              },
            ]}
          />
        )}

        {/* Add/Edit Address Modal */}
        {(addingAddress || editingAddress) && (
          <Modal
            title={addingAddress ? "Add Address" : "Edit Address"}
            onClose={() => {
              setAddingAddress(false);
              setEditingAddress(null);
            }}
            onSave={addingAddress ? handleAddAddress : handleUpdateAddress}
            fields={[
              { label: "Name", value: addressForm.Name, onChange: (e) => setAddressForm({ ...addressForm, Name: e.target.value }) },
              { label: "City", value: addressForm.City, onChange: (e) => setAddressForm({ ...addressForm, City: e.target.value }) },
              { label: "State", value: addressForm.State, onChange: (e) => setAddressForm({ ...addressForm, State: e.target.value }) },
              { label: "Pincode", value: addressForm.Pincode, onChange: (e) => setAddressForm({ ...addressForm, Pincode: e.target.value }) },
              { label: "Phone", value: addressForm.Phone, onChange: (e) => setAddressForm({ ...addressForm, Phone: e.target.value }) },
            ]}
          />
        )}
      </div>
    </>
  );
};

const Modal = ({ title, onClose, onSave, fields }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      {fields.map((field, idx) => (
        <input
          key={idx}
          value={field.value}
          onChange={field.onChange}
          placeholder={field.label}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      ))}
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-emerald-500 text-white">Save</button>
      </div>
    </motion.div>
  </div>
);

export default PaymentPage;
