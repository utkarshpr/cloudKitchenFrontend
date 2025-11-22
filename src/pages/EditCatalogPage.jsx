import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function EditCatalogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    isActive: true,
    category: "veg",
    type: "Main",
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem("cloudAuth");
        const response = await axios.get(
          "https://cloudkitchenbackend-production.up.railway.app/api/getCatalog",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const item = response.data.find((i) => i.ID === id);
        if (item) {
          setFormData({
            name: item.Name || "",
            description: item.Description || "",
            price: item.Price ? String(item.Price) : "",
            image_url: item.ImageURL || "",
            isActive: item.IsActive ?? true,
            category: item.Category || "veg",
            type: item.Type || "Main",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("❌ Failed to fetch item");
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      image_url: formData.image_url,
      isActive: formData.isActive,
      category: formData.category,
      type: formData.type,
    };

    try {
      const token = localStorage.getItem("cloudAuth");
      console.log(payload);
      await axios.patch(
        `https://cloudkitchenbackend-production.up.railway.app/api/updateCatalog/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Catalog item updated!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to update item");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">✏️ Edit Catalog Item</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Type (e.g., Main, Starter, Sweet, Drink)"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="border p-2 rounded"
          required
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="accent-blue-500"
          />
          <span className="text-sm text-gray-700">Active (available in catalog)</span>
        </label>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
        >
          Update Item
        </button>
      </form>
    </div>
  );
}

export default EditCatalogPage;
