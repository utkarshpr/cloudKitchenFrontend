import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CreateCatalogPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    isActive: true, // changed from is_active to isActive
    category: "veg",
    type: "Main",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("cloudAuth");
      if (!token) {
        toast.error("⚠️ You are not logged in!");
        navigate("/login");
        return;
      }

      // Map camelCase to snake_case before sending to backend
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image_url: formData.image_url,
        isActive: formData.isActive, // send as is_active
        category: formData.category,
        type: formData.type,
      };

      await axios.post(
        "https://cloudkitchenbackend.fly.dev/api/createCatalog",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Catalog item created successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to create item. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-emerald-600">➕ Create Catalog Item</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded"
          required
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded"
          required
        />

        {/* Image URL */}
        <input
          type="text"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="border p-2 rounded"
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border p-2 rounded"
          required
        />

        {/* Type */}
        <input
          type="text"
          placeholder="Type (e.g., Main, Starter, Sweet, Drink)"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="border p-2 rounded"
          required
        />

        {/* Category Select */}
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>

        {/* Is Active Checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="accent-emerald-500"
          />
          <span className="text-sm text-gray-700">Active (available in catalog)</span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded transition"
        >
          Create Item
        </button>
      </form>
    </div>
  );
}

export default CreateCatalogPage;
